import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log('🧪 TESTE: Verificando comportamento de chat pausado');

    // 1. Buscar um chat que está com IA pausada
    const { data: pausedChat, error: pausedError } = await supabase
      .from('whatsapp_chats')
      .select(`
        chat_id,
        ai_paused,
        contact_phone,
        contact_name,
        company_id,
        companies (
          id,
          name,
          slug
        )
      `)
      .eq('ai_paused', true)
      .limit(1)
      .single();

    if (pausedError || !pausedChat) {
      console.log('❌ Nenhum chat pausado encontrado para teste');
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Nenhum chat pausado encontrado para teste'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📱 Chat pausado encontrado:', pausedChat);

    // 2. Buscar integração WhatsApp para esta empresa
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('company_id', pausedChat.company_id)
      .eq('purpose', 'primary')
      .single();

    if (integrationError || !integration) {
      console.log('❌ Integração WhatsApp não encontrada');
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Integração WhatsApp não encontrada'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔗 Integração encontrada:', integration);

    // 3. Simular payload de webhook do WhatsApp
    const testPayload = {
      data: {
        messages: [{
          key: {
            remoteJid: pausedChat.chat_id
          },
          message: {
            conversation: "Teste - IA deveria estar pausada"
          },
          pushName: pausedChat.contact_name || "Teste"
        }]
      }
    };

    console.log('📨 Enviando payload de teste para webhook:', testPayload);

    // 4. Chamar o webhook WhatsApp com o payload de teste
    const webhookUrl = `https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook`;
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
      },
      body: JSON.stringify(testPayload)
    });

    const webhookResult = await webhookResponse.json();
    console.log('📋 Resposta do webhook:', webhookResult);

    // 5. Verificar logs recentes para este chat
    const { data: recentLogs, error: logsError } = await supabase
      .from('ai_conversation_logs')
      .select('*')
      .eq('company_id', pausedChat.company_id)
      .eq('customer_phone', pausedChat.contact_phone.replace('@s.whatsapp.net', ''))
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // últimos 5 minutos
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('📜 Logs recentes:', recentLogs);

    // 6. Verificar se houve resposta da IA (não deveria ter)
    const aiResponsesInLogs = recentLogs?.filter(log => 
      log.message_type === 'ai_response' || 
      log.message_type === 'whatsapp_sent'
    ) || [];

    console.log('🤖 Respostas da IA encontradas:', aiResponsesInLogs.length);

    // 7. Verificar se foram registrados logs de pausa
    const pausedLogs = recentLogs?.filter(log => 
      log.message_type === 'ai_paused_confirmed'
    ) || [];

    console.log('🚫 Logs de pausa encontrados:', pausedLogs.length);

    return new Response(JSON.stringify({
      status: 'success',
      test_results: {
        paused_chat: {
          chat_id: pausedChat.chat_id,
          contact_phone: pausedChat.contact_phone,
          contact_name: pausedChat.contact_name,
          company_name: (pausedChat.companies as any)?.name,
          ai_paused: pausedChat.ai_paused
        },
        integration_found: !!integration,
        webhook_response: {
          status: webhookResponse.status,
          result: webhookResult
        },
        logs_analysis: {
          total_recent_logs: recentLogs?.length || 0,
          ai_responses_count: aiResponsesInLogs.length,
          paused_confirmations: pausedLogs.length,
          recent_logs: recentLogs?.slice(0, 5) // primeiros 5 logs
        },
        conclusion: {
          ai_should_be_paused: true,
          ai_responded: aiResponsesInLogs.length > 0,
          pause_was_respected: aiResponsesInLogs.length === 0,
          pause_was_logged: pausedLogs.length > 0
        }
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});