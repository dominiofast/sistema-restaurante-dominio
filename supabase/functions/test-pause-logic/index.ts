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
    console.log('🔍 Verificando lógica de pausa do agente IA');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Testar com chat pausado
    const phoneNumberPaused = '556992454136';
    const chatIdPaused = phoneNumberPaused + '@s.whatsapp.net';
    
    console.log(`📱 Testando chat pausado: ${chatIdPaused}`);

    // Verificar dados do chat pausado
    const { data: chatData, error: chatError } = await supabase
      .from('whatsapp_chats')
      .select('ai_paused, chat_id, contact_phone')
      .eq('chat_id', chatIdPaused)
      .maybeSingle();
    
    console.log('📊 Dados do chat pausado:', chatData);
    console.log('❌ Erro na busca:', chatError);

    // Verificar integração WhatsApp
    const { data: integration } = await supabase
      .from('whatsapp_integrations')
      .select('company_id, companies(slug)')
      .limit(1)
      .maybeSingle();

    console.log('🏢 Integração encontrada:', integration);

    // Testar lógica de verificação de pausa manualmente
    if (chatData) {
      const isAIPaused = chatData.ai_paused === true;
      console.log('⏸️ Status da IA:', isAIPaused ? 'PAUSADA' : 'ATIVA');
      
      if (isAIPaused) {
        console.log('✅ Chat está pausado - IA NÃO deve responder');
      } else {
        console.log('⚠️ Chat NÃO está pausado - IA pode responder');
      }
    } else {
      console.log('❌ Chat não encontrado na base de dados');
    }

    // Simular payload de webhook para chat pausado
    const testPayload = {
      "data": {
        "id": "wamid.test_paused",
        "body": "teste para chat pausado",
        "from": phoneNumberPaused,
        "to": "5511912345678",
        "type": "text",
        "pushName": "Cliente Pausado",
        "timestamp": Math.floor(Date.now() / 1000)
      }
    };

    console.log('📤 Testando webhook com chat pausado...');

    // Chamar webhook para verificar se respeita a pausa
    const webhookResponse = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify(testPayload)
    });

    const webhookResult = await webhookResponse.json();
    console.log('📥 Resultado do webhook para chat pausado:', webhookResponse.status, webhookResult);

    // Verificar se foi criado log de "não processado"
    const { data: pausedLogs } = await supabase
      .from('ai_conversation_logs')
      .select('message_content, message_type, created_at')
      .eq('customer_phone', phoneNumberPaused)
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('📜 Logs do chat pausado:', pausedLogs);

    return new Response(JSON.stringify({
      chat_data: chatData,
      is_paused: chatData?.ai_paused === true,
      webhook_status: webhookResponse.status,
      webhook_result: webhookResult,
      recent_logs: pausedLogs,
      expected_behavior: chatData?.ai_paused ? 'NÃO deve responder' : 'Pode responder'
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no teste de pausa:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});