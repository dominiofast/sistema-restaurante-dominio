const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== WORKING SYNC FUNCTION ===')
    
    // Passo 1: Ler dados
    console.log('Passo 1: Lendo body...')
    const body = await req.json()
    const { company_id, slug } = body
    console.log('✅ Parâmetros recebidos:', { company_id, slug })

    if (!company_id) {
      console.log('❌ company_id não fornecido')
      return new Response(JSON.stringify({ 
        success: false,
        error: 'company_id é obrigatório'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Passo 2: Verificar ambiente
    console.log('Passo 2: Verificando ambiente...')
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('Env check:', {
      openai: openaiKey ? 'OK' : 'MISSING',
      supabase_url: supabaseUrl ? 'OK' : 'MISSING',
      supabase_key: supabaseKey ? 'OK' : 'MISSING'
    })

    if (!openaiKey) {
      console.log('❌ OpenAI key missing')
      return new Response(JSON.stringify({ 
        success: false,
        error: 'OPENAI_API_KEY não configurada'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Passo 3: Dados mock
    console.log('Passo 3: Preparando dados mock...')
    const assistant = {
      id: 'mock-id',
      bot_name: 'Bot Teste',
      assistant_id: 'asst_test123'
    }
    
    const companyName = 'Empresa Teste'
    const botName = 'Bot Teste'
    console.log('✅ Dados mock preparados:', { companyName, botName })

    // Passo 4: Preparar instruções (sem template strings complexas)
    console.log('Passo 4: Preparando instruções...')
    const instructions = 'Você é ' + botName + ', assistente virtual da ' + companyName + '. Seja simpático e prestativo.'
    console.log('✅ Instruções preparadas, tamanho:', instructions.length)

    // Passo 5: Simular OpenAI (sem fazer chamada real)
    console.log('Passo 5: Simulando OpenAI...')
    console.log('🧪 MODO TESTE: Assistant ID seria:', assistant.assistant_id)
    
    const mockResult = {
      id: assistant.assistant_id,
      name: botName,
      model: 'gpt-4o-mini'
    }
    console.log('✅ Simulação OpenAI concluída')

    // Passo 6: Retornar resultado
    console.log('Passo 6: Preparando resposta...')
    const response = { 
      success: true,
      message: 'Working sync executado com sucesso!',
      assistant_id: assistant.assistant_id,
      bot_name: botName,
      company_name: companyName,
      instructions_length: instructions.length
    }

    console.log('✅ Resposta preparada:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ ERRO CAPTURADO:', error)
    console.error('❌ TIPO:', typeof error)
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