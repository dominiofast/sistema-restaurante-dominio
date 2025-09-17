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

    console.log('🔧 Iniciando correção do webhook da Domínio...')

    // 1. VERIFICAR CONFIGURAÇÃO ATUAL DA DOMÍNIO
    const { data: dominioConfig, error: dominioError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('company_id', '550e8400-e29b-41d4-a716-446655440001')
      .eq('purpose', 'primary')
      .single()

    if (dominioError) {
      throw new Error(`Erro ao buscar configuração da Domínio: ${dominioError.message}`)
    }

    console.log('📋 Configuração atual da Domínio:', dominioConfig)

    // 2. VERIFICAR SE O WEBHOOK ESTÁ APONTANDO PARA FUNÇÃO INEXISTENTE
    const needsFix = dominioConfig.webhook?.includes('force-dominio-webhook')
    
    if (needsFix) {
      console.log('⚠️ Webhook da Domínio aponta para função inexistente. Corrigindo...')
      
      // Corrigir webhook para usar o padrão
      const { error: updateError } = await supabase
        .from('whatsapp_integrations')
        .update({ 
          webhook: 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook'
        })
        .eq('id', dominioConfig.id)

      if (updateError) {
        throw new Error(`Erro ao atualizar webhook: ${updateError.message}`)
      }

      console.log('✅ Webhook da Domínio corrigido')
    }

    // 3. VERIFICAR SE HÁ INSTANCE_KEYS DUPLICADOS
    const { data: quadrataConfig, error: quadrataError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('company_id', '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91')
      .eq('purpose', 'primary')
      .single()

    if (!quadrataError && quadrataConfig) {
      const instanceKeyConflict = dominioConfig.instance_key === quadrataConfig.instance_key
      
      if (instanceKeyConflict) {
        console.log('🚨 CONFLITO: Domínio e Quadrata usando mesmo instance_key!')
        console.log('Instance Key:', dominioConfig.instance_key)
        
        // Gerar novo instance_key para Quadrata
        const newInstanceKey = 'megacode-QUAD' + Math.random().toString(36).substring(2, 10).toUpperCase()
        
        const { error: quadrataUpdateError } = await supabase
          .from('whatsapp_integrations')
          .update({ instance_key: newInstanceKey })
          .eq('id', quadrataConfig.id)

        if (quadrataUpdateError) {
          throw new Error(`Erro ao atualizar instance_key da Quadrata: ${quadrataUpdateError.message}`)
        }

        console.log('✅ Instance key da Quadrata atualizado para:', newInstanceKey)
      }
    }

    // 4. LOG DA CORREÇÃO
    await supabase
      .from('ai_conversation_logs')
      .insert({
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        customer_phone: 'SYSTEM_FIX',
        customer_name: 'WEBHOOK_CORRECTION',
        message_content: `CORREÇÃO APLICADA: Webhook da Domínio corrigido. Cross-talk com Quadrata resolvido.`,
        message_type: 'webhook_correction',
        created_at: new Date().toISOString()
      })

    // 5. VERIFICAR CONFIGURAÇÕES FINAIS
    const { data: finalDominioConfig } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('company_id', '550e8400-e29b-41d4-a716-446655440001')
      .eq('purpose', 'primary')
      .single()

    const { data: finalQuadrataConfig } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('company_id', '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91')
      .eq('purpose', 'primary')
      .single()

    const result = {
      success: true,
      message: 'Correção aplicada com sucesso',
      timestamp: new Date().toISOString(),
      changes: {
        dominio_webhook_fixed: needsFix,
        instance_key_conflict_resolved: !quadrataError && quadrataConfig && dominioConfig.instance_key === quadrataConfig.instance_key
      },
      final_configs: {
        dominio: {
          instance_key: finalDominioConfig?.instance_key,
          webhook: finalDominioConfig?.webhook,
          is_active: finalDominioConfig?.is_active
        },
        quadrata: finalQuadrataConfig ? {
          instance_key: finalQuadrataConfig.instance_key,
          webhook: finalQuadrataConfig.webhook,
          is_active: finalQuadrataConfig.is_active
        } : null
      }
    }

    console.log('🎉 Correção concluída:', result)

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro na correção:', error)
    
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
