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
    console.log('🧪 TESTE FINAL: Verificando lógica de pausa por conversa específica');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar integração WhatsApp
    const { data: integration } = await supabase
      .from('whatsapp_integrations')
      .select('company_id, companies(slug)')
      .limit(1)
      .maybeSingle();

    console.log('🏢 Integração encontrada:', integration);

    // Teste 1: Chat pausado
    const phoneNumberPaused = '556992454136';
    const chatIdPaused = phoneNumberPaused + '@s.whatsapp.net';
    
    console.log(`\n📱 TESTE 1: Chat PAUSADO - ${chatIdPaused}`);
    
    const testPayloadPaused = {
      "data": {
        "id": "wamid.test_paused_final",
        "body": "teste conversa pausada",
        "from": phoneNumberPaused,
        "to": "5511912345678",
        "type": "text",
        "pushName": "Cliente Pausado",
        "timestamp": Math.floor(Date.now() / 1000)
      }
    };

    const webhookResponsePaused = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify(testPayloadPaused)
    });

    const resultPaused = await webhookResponsePaused.json();
    console.log('📤 Resultado chat pausado:', webhookResponsePaused.status, resultPaused);

    // Teste 2: Chat ativo
    const phoneNumberActive = '556993910380';
    const chatIdActive = phoneNumberActive + '@s.whatsapp.net';
    
    console.log(`\n📱 TESTE 2: Chat ATIVO - ${chatIdActive}`);
    
    const testPayloadActive = {
      "data": {
        "id": "wamid.test_active_final",
        "body": "teste conversa ativa",
        "from": phoneNumberActive,
        "to": "5511912345678",
        "type": "text",
        "pushName": "Cliente Ativo",
        "timestamp": Math.floor(Date.now() / 1000)
      }
    };

    const webhookResponseActive = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify(testPayloadActive)
    });

    const resultActive = await webhookResponseActive.json();
    console.log('📤 Resultado chat ativo:', webhookResponseActive.status, resultActive);

    // Verificar logs
    const { data: recentLogs } = await supabase
      .from('ai_conversation_logs')
      .select('customer_phone, message_type, message_content, created_at')
      .in('customer_phone', [phoneNumberPaused, phoneNumberActive])
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('📜 Logs recentes dos testes:', recentLogs);

    return new Response(JSON.stringify({
      integration: integration,
      test_paused: {
        phone: phoneNumberPaused,
        status: webhookResponsePaused.status,
        result: resultPaused,
        expected: 'deve ser pausado'
      },
      test_active: {
        phone: phoneNumberActive,
        status: webhookResponseActive.status,
        result: resultActive,
        expected: 'deve responder normalmente'
      },
      recent_logs: recentLogs,
      conclusion: {
        paused_working: resultPaused.status === 'paused',
        active_working: resultActive.status === 'success'
      }
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no teste final:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});