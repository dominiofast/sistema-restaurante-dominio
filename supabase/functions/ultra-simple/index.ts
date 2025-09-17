const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== ULTRA SIMPLE FUNCTION ===')
    
    // Teste 1: Ler body
    console.log('Passo 1: Lendo body...')
    const body = await req.json()
    console.log('✅ Body lido:', body)

    // Teste 2: Verificar parâmetros
    console.log('Passo 2: Verificando parâmetros...')
    const { company_id, slug } = body
    console.log('✅ Parâmetros:', { company_id, slug })

    // Teste 3: Verificar env vars
    console.log('Passo 3: Verificando variáveis de ambiente...')
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    console.log('✅ OpenAI Key:', openaiKey ? 'PRESENTE' : 'AUSENTE')

    // Teste 4: Retornar sucesso
    console.log('Passo 4: Retornando sucesso...')
    const result = {
      success: true,
      message: 'Ultra simple function funcionando',
      received_params: { company_id, slug },
      openai_key_present: !!openaiKey
    }

    console.log('✅ Resultado preparado:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error)
    console.error('❌ TIPO DO ERRO:', typeof error)
    console.error('❌ MENSAGEM:', error.message)
    console.error('❌ STACK:', error.stack)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      error_type: typeof error,
      stack: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})