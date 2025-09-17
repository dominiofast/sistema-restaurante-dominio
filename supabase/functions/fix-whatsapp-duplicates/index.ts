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
    const { action } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`🔧 Executando limpeza de duplicados: ${action}`)

    if (action === 'fix_dominio_duplicates') {
      // Verificar se há múltiplas configurações para Domínio
      const { data: dominioConfigs, error: configError } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .eq('company_id', '550e8400-e29b-41d4-a716-446655440001')
        .eq('purpose', 'primary')

      if (configError) {
        throw new Error(`Erro ao buscar configurações: ${configError.message}`)
      }

      console.log(`📋 Encontradas ${dominioConfigs?.length} configurações para Domínio`)

      // Se há múltiplas, manter apenas a mais recente
      if (dominioConfigs && dominioConfigs.length > 1) {
        const latestConfig = dominioConfigs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        const oldConfigs = dominioConfigs.filter(config => config.id !== latestConfig.id)

        console.log(`🗑️ Removendo ${oldConfigs.length} configurações antigas`)

        for (const oldConfig of oldConfigs) {
          await supabase
            .from('whatsapp_integrations')
            .delete()
            .eq('id', oldConfig.id)
          
          console.log(`✅ Removida configuração duplicada: ${oldConfig.id}`)
        }

        // Log da operação
        await supabase
          .from('ai_conversation_logs')
          .insert({
            company_id: '550e8400-e29b-41d4-a716-446655440001',
            customer_phone: 'SYSTEM_CLEANUP',
            customer_name: 'DUPLICATE_FIX',
            message_content: `LIMPEZA: Removidas ${oldConfigs.length} configurações duplicadas da Domínio. Mantida configuração: ${latestConfig.instance_key}`,
            message_type: 'duplicate_cleanup',
            created_at: new Date().toISOString()
          })
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'fix_dominio_duplicates',
        configs_found: dominioConfigs?.length || 0,
        configs_removed: dominioConfigs && dominioConfigs.length > 1 ? dominioConfigs.length - 1 : 0,
        active_config: dominioConfigs?.[0] || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'clear_old_webhooks') {
      // Limpar webhooks antigos que ainda apontam para dominio.tech
      const { data: oldWebhooks, error: webhookError } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .or('webhook.like.%dominio.tech%,webhook.like.%pedido.dominio.tech%')
        .neq('webhook', 'like.%epqppxteicfuzdblbluq.supabase.co%')

      if (webhookError) {
        throw new Error(`Erro ao buscar webhooks antigos: ${webhookError.message}`)
      }

      console.log(`🧹 Encontrados ${oldWebhooks?.length || 0} webhooks antigos para atualizar`)

      let updatedCount = 0
      if (oldWebhooks && oldWebhooks.length > 0) {
        for (const webhook of oldWebhooks) {
          const newWebhookUrl = `https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook/${webhook.instance_key}`
          
          await supabase
            .from('whatsapp_integrations')
            .update({ webhook: newWebhookUrl })
            .eq('id', webhook.id)
          
          console.log(`✅ Atualizado webhook: ${webhook.instance_key} -> ${newWebhookUrl}`)
          updatedCount++
        }
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'clear_old_webhooks',
        webhooks_found: oldWebhooks?.length || 0,
        webhooks_updated: updatedCount
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'analyze_message_flow') {
      // Analisar fluxo de mensagens recentes para detectar duplicação
      const { data: recentMessages, error: messagesError } = await supabase
        .from('ai_conversation_logs')
        .select('*')
        .in('company_id', ['550e8400-e29b-41d4-a716-446655440001', '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91'])
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // últimos 30 minutos
        .order('created_at', { ascending: false })
        .limit(50)

      const analysis = {
        total_messages: recentMessages?.length || 0,
        dominio_messages: recentMessages?.filter(m => m.company_id === '550e8400-e29b-41d4-a716-446655440001').length || 0,
        quadrata_messages: recentMessages?.filter(m => m.company_id === '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91').length || 0,
        duplicate_indicators: [],
        timeline: recentMessages?.map(m => ({
          time: m.created_at,
          company: m.company_id === '550e8400-e29b-41d4-a716-446655440001' ? 'Domínio' : 'Quadrata',
          type: m.message_type,
          content: m.message_content.substring(0, 100)
        })) || []
      }

      // Detectar possíveis duplicatas (mesmo conteúdo em empresas diferentes em timeframe próximo)
      if (recentMessages) {
        const messageGroups = {}
        recentMessages.forEach(msg => {
          const timeWindow = Math.floor(new Date(msg.created_at).getTime() / (60 * 1000)) // janela de 1 minuto
          const key = `${msg.customer_phone}_${timeWindow}_${msg.message_content.substring(0, 50)}`
          
          if (!messageGroups[key]) {
            messageGroups[key] = []
          }
          messageGroups[key].push(msg)
        })

        Object.entries(messageGroups).forEach(([key, messages]) => {
          if (messages.length > 1) {
            const companies = [...new Set(messages.map(m => m.company_id === '550e8400-e29b-41d4-a716-446655440001' ? 'Domínio' : 'Quadrata'))]
            if (companies.length > 1) {
              analysis.duplicate_indicators.push({
                key,
                count: messages.length,
                companies,
                messages: messages.map(m => ({
                  company: m.company_id === '550e8400-e29b-41d4-a716-446655440001' ? 'Domínio' : 'Quadrata',
                  time: m.created_at,
                  type: m.message_type
                }))
              })
            }
          }
        })
      }

      return new Response(JSON.stringify(analysis, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Ação não reconhecida',
      available_actions: ['fix_dominio_duplicates', 'clear_old_webhooks', 'analyze_message_flow']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro na limpeza de duplicados:', error)
    
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