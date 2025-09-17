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
    console.log('🧪 Testando webhook com dados reais');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Simular dados de webhook do WhatsApp
    const testPayload = {
      "data": {
        "id": "wamid.test123",
        "body": "oi",
        "from": "556993910380",
        "to": "5511912345678",
        "type": "text",
        "pushName": "Cliente Teste",
        "timestamp": Math.floor(Date.now() / 1000)
      }
    };

    console.log('📤 Enviando payload de teste:', JSON.stringify(testPayload, null, 2));

    // Chamar o webhook real
    const webhookResponse = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify(testPayload)
    });

    const webhookResult = await webhookResponse.json();
    console.log('📥 Resposta do webhook:', webhookResponse.status, webhookResult);

    // Verificar logs recentes
    const { data: recentLogs } = await supabase
      .from('ai_conversation_logs')
      .select('message_content, message_type, created_at')
      .eq('customer_phone', '556993910380')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('📜 Logs recentes:', recentLogs);

    return new Response(JSON.stringify({
      webhook_status: webhookResponse.status,
      webhook_result: webhookResult,
      recent_logs: recentLogs
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});