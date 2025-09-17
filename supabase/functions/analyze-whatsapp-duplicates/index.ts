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

    console.log('🔍 Analisando duplicação de respostas WhatsApp...')

    // 1. Verificar se há instance_keys duplicados
    const { data: duplicatedInstances, error: duplicatedError } = await supabase
      .from('whatsapp_integrations')
      .select(`
        instance_key,
        company_id,
        companies!inner(name, slug),
        webhook,
        created_at
      `)
      .eq('purpose', 'primary')

    if (duplicatedError) {
      throw new Error(`Erro ao buscar integrações: ${duplicatedError.message}`)
    }

    // Agrupar por instance_key para detectar duplicados
    const instanceGroups = {}
    duplicatedInstances?.forEach(integration => {
      if (!instanceGroups[integration.instance_key]) {
        instanceGroups[integration.instance_key] = []
      }
      instanceGroups[integration.instance_key].push(integration)
    })

    // Identificar problemas
    const duplicatedKeys = Object.entries(instanceGroups).filter(([key, instances]) => instances.length > 1)
    const sharedWebhooks = {}
    
    duplicatedInstances?.forEach(integration => {
      if (!sharedWebhooks[integration.webhook]) {
        sharedWebhooks[integration.webhook] = []
      }
      sharedWebhooks[integration.webhook].push(integration)
    })

    const sharedWebhookUrls = Object.entries(sharedWebhooks).filter(([url, instances]) => instances.length > 1)

    // 2. Buscar logs recentes de mensagens para Domínio
    const { data: recentLogs, error: logsError } = await supabase
      .from('ai_conversation_logs')
      .select('*')
      .eq('company_id', '550e8400-e29b-41d4-a716-446655440001')
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // últimos 10 minutos
      .order('created_at', { ascending: false })
      .limit(20)

    // 3. Verificar se há mensagens duplicadas (mesmo timestamp, mesmo conteúdo)
    const duplicatedMessages = []
    if (recentLogs) {
      const messageMap = {}
      recentLogs.forEach(log => {
        const key = `${log.customer_phone}_${log.message_content.substring(0, 50)}_${Math.floor(new Date(log.created_at).getTime() / (30 * 1000))}`
        if (!messageMap[key]) {
          messageMap[key] = []
        }
        messageMap[key].push(log)
      })
      
      Object.entries(messageMap).forEach(([key, logs]) => {
        if (logs.length > 1) {
          duplicatedMessages.push({ key, count: logs.length, logs })
        }
      })
    }

    // 4. Analisar configurações de webhook específicas da Domínio
    const { data: dominioConfig, error: dominioError } = await supabase
      .from('whatsapp_integrations')
      .select(`
        *,
        companies!inner(name, slug)
      `)
      .eq('company_id', '550e8400-e29b-41d4-a716-446655440001')

    console.log('🔍 Configurações da Domínio:', dominioConfig)

    const analysis = {
      timestamp: new Date().toISOString(),
      total_integrations: duplicatedInstances?.length || 0,
      duplicated_instance_keys: duplicatedKeys.map(([key, instances]) => ({
        instance_key: key,
        count: instances.length,
        companies: instances.map(i => ({
          name: i.companies.name,
          slug: i.companies.slug,
          webhook: i.webhook
        }))
      })),
      shared_webhooks: sharedWebhookUrls.map(([url, instances]) => ({
        webhook_url: url,
        count: instances.length,
        companies: instances.map(i => ({
          name: i.companies.name,
          slug: i.companies.slug,
          instance_key: i.instance_key
        }))
      })),
      dominio_config: dominioConfig,
      recent_duplicate_messages: duplicatedMessages,
      recommendations: []
    }

    // Gerar recomendações
    if (duplicatedKeys.length > 0) {
      analysis.recommendations.push('⚠️ CRITICAL: Instance keys duplicados detectados - cada empresa deve ter seu próprio instance_key único')
    }

    if (sharedWebhookUrls.length > 0) {
      analysis.recommendations.push('⚠️ CRITICAL: Webhooks compartilhados detectados - cada empresa deve ter webhook único')
    }

    if (duplicatedMessages.length > 0) {
      analysis.recommendations.push(`⚠️ ${duplicatedMessages.length} grupos de mensagens duplicadas detectados nos últimos 10 minutos`)
    }

    if (analysis.recommendations.length === 0) {
      analysis.recommendations.push('✅ Nenhuma duplicação óbvia detectada na configuração')
    }

    // Verificação especial para Domínio vs Quadrata
    const dominioInstance = duplicatedInstances?.find(i => i.company_id === '550e8400-e29b-41d4-a716-446655440001')
    const quadrataInstance = duplicatedInstances?.find(i => i.company_id === '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91')

    if (dominioInstance && quadrataInstance) {
      analysis.dominio_vs_quadrata = {
        dominio: {
          instance_key: dominioInstance.instance_key,
          webhook: dominioInstance.webhook,
          host: dominioInstance.host
        },
        quadrata: {
          instance_key: quadrataInstance.instance_key,
          webhook: quadrataInstance.webhook,
          host: quadrataInstance.host
        },
        same_instance_key: dominioInstance.instance_key === quadrataInstance.instance_key,
        same_webhook: dominioInstance.webhook === quadrataInstance.webhook,
        same_host: dominioInstance.host === quadrataInstance.host
      }

      if (dominioInstance.instance_key === quadrataInstance.instance_key) {
        analysis.recommendations.push('🚨 PROBLEMA ENCONTRADO: Domínio e Quadrata estão usando o mesmo instance_key!')
      }
    }

    return new Response(JSON.stringify(analysis, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro na análise de duplicação:', error)
    
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