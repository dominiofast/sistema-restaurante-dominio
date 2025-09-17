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
    console.log('🔄 Sincronizando assistant da Quadrata Pizzas...');
    
    // Chamar a função sync-assistant para a empresa específica
    const syncResponse = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/sync-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: 'quadratapizzas'
      })
    });
    
    const syncResult = await syncResponse.json();
    console.log('✅ Resultado da sincronização:', syncResult);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Assistant sincronizado com sucesso!',
      syncResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});