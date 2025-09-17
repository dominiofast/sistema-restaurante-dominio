import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, company_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    switch (action) {
      case 'auto_pause_on_disable':
        // Pausar todos os chats quando IA for desabilitada
        await supabase
          .from('whatsapp_chats')
          .update({ ai_paused: true, updated_at: new Date().toISOString() })
          .eq('company_id', company_id)

        // Log da ação
        await supabase
          .from('ai_conversation_logs')
          .insert({
            company_id,
            customer_phone: 'SYSTEM',
            customer_name: 'AUTO_BLOCKER',
            message_content: 'Chats pausados automaticamente - IA desabilitada',
            message_type: 'auto_pause',
            created_at: new Date().toISOString()
          })

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Chats pausados automaticamente' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'auto_resume_on_enable':
        // Reativar chats quando IA for habilitada (apenas se não pausados manualmente)
        await supabase
          .from('whatsapp_chats')
          .update({ ai_paused: false, updated_at: new Date().toISOString() })
          .eq('company_id', company_id)
          .eq('ai_paused', true)

        // Log da ação
        await supabase
          .from('ai_conversation_logs')
          .insert({
            company_id,
            customer_phone: 'SYSTEM',
            customer_name: 'AUTO_BLOCKER',
            message_content: 'Chats reativados automaticamente - IA habilitada',
            message_type: 'auto_resume',
            created_at: new Date().toISOString()
          })

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Chats reativados automaticamente' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'check_status':
        // Verificar status atual dos bloqueios
        const { data: emergencyStatus } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'emergency_block_legacy_ai')
          .single()

        const { data: aiConfig } = await supabase
          .from('ai_agent_config')
          .select('is_active')
          .eq('company_id', company_id)
          .single()

        const { data: chatCount } = await supabase
          .from('whatsapp_chats')
          .select('id', { count: 'exact' })
          .eq('company_id', company_id)
          .eq('ai_paused', true)

        return new Response(JSON.stringify({ 
          success: true, 
          status: {
            emergency_block: emergencyStatus?.value === 'true',
            ai_config_active: aiConfig?.is_active || false,
            paused_chats: chatCount || 0
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Ação não reconhecida' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})