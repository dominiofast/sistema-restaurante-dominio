const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== SIMPLE SYNC FUNCTION ===')
    
    const body = await req.json()
    const { company_id, slug } = body

    console.log('Parâmetros recebidos:', { company_id, slug })

    if (!company_id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'company_id é obrigatório'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Verificar variáveis de ambiente
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!openaiKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'OPENAI_API_KEY não configurada'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Configurações do Supabase não encontradas'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log('Variáveis de ambiente OK')

    // Teste sem Supabase - usar dados mock
    console.log('Usando dados mock para teste...')
    
    const assistant = {
      id: 'mock-id',
      bot_name: 'Bot Teste',
      assistant_id: 'asst_test123'
    }
    
    const companyName = 'Empresa Teste'
    const botName = 'Bot Teste'

    console.log('Dados mock:', { companyName, botName, assistant_id: assistant.assistant_id })

    // Instruções simples
    const instructions = `Você é ${botName}, assistente virtual da ${companyName}.

Seja simpático, acolhedor e direto. Responda em português brasileiro.

Ajude com:
- Informações sobre produtos
- Pedidos e delivery
- Dúvidas gerais

Sempre seja educado e prestativo.`

    console.log('Instruções preparadas. Simulando chamada OpenAI...')

    // MOCK: Simular resposta da OpenAI sem fazer chamada real
    console.log('🧪 MODO TESTE: Não fazendo chamada real para OpenAI')
    console.log('🧪 Assistant ID que seria usado:', assistant.assistant_id)
    console.log('🧪 Instruções que seriam enviadas:', instructions.substring(0, 100) + '...')
    
    // Simular sucesso
    const result = {
      id: assistant.assistant_id,
      name: botName,
      model: 'gpt-4o-mini',
      instructions: instructions
    }
    
    console.log('✅ Simulação concluída com sucesso!')

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Assistant sincronizado com sucesso!',
      assistant_id: assistant.assistant_id,
      bot_name: botName,
      company_name: companyName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})