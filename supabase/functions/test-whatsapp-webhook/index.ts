import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

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
    console.log('🧪 Teste webhook WhatsApp iniciado');

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Simular mensagem de teste
    const testMessage = {
      data: {
        messages: [{
          key: {
            remoteJid: "5511999999999@s.whatsapp.net"
          },
          message: {
            conversation: "Olá, teste do agente IA"
          },
          pushName: "Usuário Teste"
        }]
      }
    };

    console.log('📨 Enviando mensagem de teste para webhook...');

    // Chamar o webhook
    const webhookResponse = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    const webhookResult = await webhookResponse.json();
    console.log('📤 Resposta do webhook:', webhookResult);

    // Verificar logs recentes
    const { data: logs } = await supabase
      .from('ai_conversation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('📋 Logs recentes:', logs);

    return new Response(JSON.stringify({
      webhook_status: webhookResponse.status,
      webhook_response: webhookResult,
      recent_logs: logs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});