const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== MINIMAL TEST FUNCTION ===')
    
    // Teste 1: Receber dados
    let body = {}
    try {
      body = await req.json()
      console.log('✅ Body recebido:', body)
    } catch (e) {
      console.log('⚠️ Erro ao ler body:', e.message)
    }

    // Teste 2: Variáveis de ambiente
    const envTest = {
      openai: Deno.env.get('OPENAI_API_KEY') ? 'OK' : 'MISSING',
      supabase_url: Deno.env.get('SUPABASE_URL') ? 'OK' : 'MISSING',
      supabase_key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'OK' : 'MISSING'
    }
    console.log('✅ Env test:', envTest)

    // Teste 3: Resposta simples
    const result = {
      success: true,
      message: 'Função minimal funcionando',
      timestamp: new Date().toISOString(),
      body_received: body,
      environment: envTest
    }

    console.log('✅ Retornando resultado:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error)
    console.error('❌ STACK:', error.stack)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})