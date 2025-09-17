const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== DEBUG SYNC FUNCTION ===')
    
    // Verificar variáveis de ambiente básicas
    const envVars = {
      OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY') ? 'PRESENTE' : 'AUSENTE',
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'PRESENTE' : 'AUSENTE',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'PRESENTE' : 'AUSENTE'
    }
    
    console.log('Variáveis de ambiente:', envVars)

    // Teste básico de conectividade
    let connectivityTest = 'OK'
    try {
      const testResponse = await fetch('https://httpbin.org/get')
      if (!testResponse.ok) {
        connectivityTest = `HTTP_ERROR_${testResponse.status}`
      }
    } catch (error) {
      connectivityTest = `NETWORK_ERROR: ${error.message}`
    }

    // Teste da API OpenAI (se a chave estiver presente)
    let openaiTest = 'NOT_TESTED'
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (openaiKey) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
          }
        })
        openaiTest = openaiResponse.ok ? 'OK' : `ERROR_${openaiResponse.status}`
      } catch (error) {
        openaiTest = `NETWORK_ERROR: ${error.message}`
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: envVars,
      connectivity: connectivityTest,
      openai_api: openaiTest,
      deno_version: Deno.version.deno,
      message: 'Debug function executada com sucesso'
    }

    console.log('Resultado do debug:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Erro na função de debug:', error)
    
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