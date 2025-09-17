import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 [TEST-AI-CHAT-HORARIOS] Testando função ai-chat-direct com horários dinâmicos...');
    
    // Configurar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Testar a função ai-chat-direct com uma pergunta sobre horários
    const testPayload = {
      company_id: '550e8400-e29b-41d4-a716-446655440001',
      company_slug: 'dominiopizzas',
      user_message: 'Vocês estão abertos agora?',
      customer_phone: '556992254080',
      customer_name: 'Teste',
    };

    console.log('🔥 Chamando ai-chat-direct com payload:', JSON.stringify(testPayload, null, 2));

    // Chamar a edge function ai-chat-direct
    const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat-direct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    console.log('✅ Resultado do teste:', JSON.stringify(result, null, 2));

    return new Response(JSON.stringify({ 
      success: true,
      test_type: 'ai_chat_horarios_dinamicos',
      test_message: testPayload.user_message,
      ai_response: result.response,
      full_result: result,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});