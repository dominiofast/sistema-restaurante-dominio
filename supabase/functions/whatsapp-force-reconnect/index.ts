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
    const { company_id, instance_key } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`🔄 Forçando reconexão para company_id: ${company_id}, instance_key: ${instance_key}`)

    // Buscar dados da integração
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select(`
        *,
        companies!inner(name, slug)
      `)
      .eq('company_id', company_id)
      .eq('purpose', 'primary')
      .single()

    if (integrationError || !integration) {
      throw new Error(`Integração não encontrada: ${integrationError?.message}`)
    }

    console.log(`📋 Reconectando ${integration.companies.name}...`)

    // 1. Verificar status atual
    const statusResponse = await fetch(`https://${integration.host}/api/v1/instance/status/${integration.instance_key}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${integration.token}`,
        'Content-Type': 'application/json'
      }
    })

    const currentStatus = await statusResponse.json()
    console.log(`📊 Status atual:`, currentStatus)

    // 2. Forçar desconexão se necessário
    if (currentStatus.state === 'open') {
      console.log('🔌 Desconectando instância...')
      try {
        await fetch(`https://${integration.host}/api/v1/instance/logout/${integration.instance_key}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${integration.token}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('✅ Desconexão enviada')
      } catch (logoutError) {
        console.log('⚠️ Erro na desconexão (continuando):', logoutError)
      }
    }

    // 3. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 4. Restart da instância
    console.log('🚀 Reiniciando instância...')
    const restartResponse = await fetch(`https://${integration.host}/api/v1/instance/restart/${integration.instance_key}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.token}`,
        'Content-Type': 'application/json'
      }
    })

    const restartResult = await restartResponse.json()
    console.log(`🔄 Resultado do restart:`, restartResult)

    // 5. Aguardar e verificar status final
    await new Promise(resolve => setTimeout(resolve, 3000))

    const finalStatusResponse = await fetch(`https://${integration.host}/api/v1/instance/status/${integration.instance_key}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${integration.token}`,
        'Content-Type': 'application/json'
      }
    })

    const finalStatus = await finalStatusResponse.json()
    console.log(`📊 Status final:`, finalStatus)

    // Log da operação
    await supabase
      .from('ai_conversation_logs')
      .insert({
        company_id: integration.company_id,
        customer_phone: 'SYSTEM_RECONNECT',
        customer_name: 'FORCE_RECONNECT',
        message_content: `RECONEXÃO FORÇADA: ${integration.companies.name} | Status inicial: ${currentStatus.state} | Status final: ${finalStatus.state} | Instance: ${integration.instance_key}`,
        message_type: 'force_reconnect',
        created_at: new Date().toISOString()
      })

    return new Response(JSON.stringify({
      success: true,
      company_name: integration.companies.name,
      instance_key: integration.instance_key,
      initial_status: currentStatus.state,
      final_status: finalStatus.state,
      reconnected: finalStatus.state === 'open',
      restart_result: restartResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro na reconexão forçada:', error)
    
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