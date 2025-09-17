import { serve } from "https://deno.land/std@0.223.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== TEST SYNC FUNCTION ===');
    
    // Verificar variáveis de ambiente
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const envCheck = {
      OPENAI_API_KEY: OPENAI_API_KEY ? 'OK' : 'MISSING',
      SUPABASE_URL: SUPABASE_URL ? 'OK' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'
    };

    console.log('Environment check:', envCheck);

    // Teste simples da API da OpenAI
    let openaiTest = 'NOT_TESTED';
    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          }
        });
        openaiTest = response.ok ? 'OK' : `ERROR_${response.status}`;
      } catch (error) {
        openaiTest = `ERROR: ${error.message}`;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      openai_test: openaiTest,
      message: 'Test function working correctly'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Test function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});