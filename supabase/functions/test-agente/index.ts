import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Iniciando teste da edge function agente-ia-conversa');

    // Teste direto para a edge function
    const testPayload = {
      userMessage: "Olá, quero fazer um pedido",
      customerPhone: "5511999999999", 
      customerName: "Cliente Teste",
      slug_empresa: "quadrata-pizzas"
    };

    console.log('📤 Payload de teste:', JSON.stringify(testPayload, null, 2));

    // Chamada para a edge function
    const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/agente-ia-conversa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📥 Status da resposta:', response.status);
    console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 Resposta:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText, parseError: e.message };
    }

    return new Response(JSON.stringify({
      success: true,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});