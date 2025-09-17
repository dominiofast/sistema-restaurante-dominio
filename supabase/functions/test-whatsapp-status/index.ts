import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Testando status completo do sistema');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Verificar integração WhatsApp
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (integrationError || !integration) {
      return new Response(JSON.stringify({ 
        error: 'Integração WhatsApp não encontrada',
        details: integrationError 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Integração encontrada:', integration.instance_key);

    // 2. Verificar prompt atual
    const { data: prompt } = await supabase
      .from('ai_agent_prompts')
      .select('version, updated_at, template')
      .eq('agent_slug', 'agente-ia-conversa')
      .maybeSingle();

    console.log('✅ Prompt encontrado:', prompt?.version);

    // 3. Testar webhook simulando mensagem REAL
    console.log('📞 Testando webhook com mensagem simulada');
    
    const testMessage = {
      data: {
        messages: [{
          key: { remoteJid: '5511999999999@s.whatsapp.net' },
          message: { conversation: 'teste com nome' },
          pushName: 'Fernando Freire'  // Nome específico para teste
        }]
      }
    };

    const { data: webhookResult, error: webhookError } = await supabase.functions.invoke('whatsapp-webhook', {
      body: testMessage
    });

    console.log('📱 Resultado webhook:', webhookResult);
    if (webhookError) console.log('❌ Erro webhook:', webhookError);

    // 4. Verificar se logs foram criados
    const { data: logs } = await supabase
      .from('ai_conversation_logs')
      .select('*')
      .eq('customer_phone', '5511999999999')
      .order('created_at', { ascending: false })
      .limit(2);

    console.log('📋 Logs encontrados:', logs?.length || 0);

    return new Response(JSON.stringify({
      status: 'success',
      results: {
        integration_ok: !!integration,
        prompt_version: prompt?.version,
        prompt_has_customer_name: prompt?.template?.includes('{{customer_name}}') || false,
        prompt_updated_at: prompt?.updated_at,
        webhook_test: {
          success: !webhookError,
          error: webhookError?.message
        },
        logs_created: logs?.length || 0,
        logs_content: logs?.map(l => ({ type: l.message_type, content: l.message_content?.substring(0, 100) }))
      },
      conclusion: webhookError ? 'ERRO: Webhook não funcionou' : 
                  !logs?.length ? 'ERRO: Webhook não criou logs' :
                  logs.find(l => l.message_content?.includes('Fernando Freire')) ? 'SUCESSO: Nome sendo usado' :
                  'PROBLEMA: Nome não está sendo usado'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});