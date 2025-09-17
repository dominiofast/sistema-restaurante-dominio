import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🔍 Iniciando monitoramento de conexões WhatsApp...')

    // Buscar todas as integrações ativas
    const { data: integrations, error: integrationsError } = await supabase
      .from('whatsapp_integrations')
      .select(`
        *,
        companies!inner(name, slug)
      `)
      .eq('purpose', 'primary')

    if (integrationsError) {
      throw new Error(`Erro ao buscar integrações: ${integrationsError.message}`)
    }

    console.log(`📋 Encontradas ${integrations?.length || 0} integrações para monitorar`)

    const connectionResults = []

    // Verificar status de cada integração
    for (const integration of integrations || []) {
      console.log(`🔍 Verificando ${integration.companies.name} (${integration.instance_key})...`)
      
      try {
        // Verificar status da instância via API
        const statusResponse = await fetch(`https://${integration.host}/api/v1/instance/status/${integration.instance_key}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${integration.token}`,
            'Content-Type': 'application/json'
          }
        })

        const statusData = await statusResponse.json()
        console.log(`📊 Status ${integration.companies.name}:`, statusData)

        const connectionStatus = {
          company_name: integration.companies.name,
          company_slug: integration.companies.slug,
          instance_key: integration.instance_key,
          host: integration.host,
          status: statusData.state || 'unknown',
          connected: statusData.state === 'open',
          last_check: new Date().toISOString(),
          details: statusData
        }

        connectionResults.push(connectionStatus)

        // Se desconectado, tentar reconectar automaticamente
        if (statusData.state !== 'open') {
          console.log(`⚠️ ${integration.companies.name} está desconectado. Tentando reconectar...`)
          
          try {
            const reconnectResponse = await fetch(`https://${integration.host}/api/v1/instance/restart/${integration.instance_key}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${integration.token}`,
                'Content-Type': 'application/json'
              }
            })

            const reconnectData = await reconnectResponse.json()
            console.log(`🔄 Resultado da reconexão ${integration.companies.name}:`, reconnectData)

            connectionStatus.reconnect_attempted = true
            connectionStatus.reconnect_result = reconnectData

          } catch (reconnectError) {
            console.error(`❌ Erro na reconexão ${integration.companies.name}:`, reconnectError)
            connectionStatus.reconnect_error = reconnectError.message
          }
        }

        // Log no banco para monitoramento
        await supabase
          .from('ai_conversation_logs')
          .insert({
            company_id: integration.company_id,
            customer_phone: 'SYSTEM_MONITOR',
            customer_name: 'CONNECTION_MONITOR',
            message_content: `STATUS: ${integration.companies.name} - ${statusData.state} | Host: ${integration.host} | Instance: ${integration.instance_key}`,
            message_type: 'connection_status',
            created_at: new Date().toISOString()
          })

      } catch (error) {
        console.error(`❌ Erro ao verificar ${integration.companies.name}:`, error)
        
        const errorStatus = {
          company_name: integration.companies.name,
          company_slug: integration.companies.slug,
          instance_key: integration.instance_key,
          host: integration.host,
          status: 'error',
          connected: false,
          error: error.message,
          last_check: new Date().toISOString()
        }

        connectionResults.push(errorStatus)

        // Log do erro
        await supabase
          .from('ai_conversation_logs')
          .insert({
            company_id: integration.company_id,
            customer_phone: 'SYSTEM_MONITOR',
            customer_name: 'CONNECTION_MONITOR',
            message_content: `ERRO: ${integration.companies.name} - ${error.message} | Host: ${integration.host}`,
            message_type: 'connection_error',
            created_at: new Date().toISOString()
          })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      total_integrations: integrations?.length || 0,
      connections: connectionResults,
      summary: {
        connected: connectionResults.filter(c => c.connected).length,
        disconnected: connectionResults.filter(c => !c.connected).length,
        errors: connectionResults.filter(c => c.error).length
      }
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro no monitor de conexões:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})