const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== SYNC ASSISTANT FINAL ===')
    
    const body = await req.json()
    const { company_id, slug } = body
    console.log('✅ Parâmetros:', { company_id, slug })

    if (!company_id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'company_id é obrigatório'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Verificar ambiente
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!openaiKey || !supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Configurações de ambiente não encontradas'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log('✅ Ambiente OK')

    // Importar e conectar Supabase
    const supabaseModule = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = supabaseModule.createClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase conectado')

    // Buscar assistente
    const { data: assistant, error: assistantError } = await supabase
      .from('ai_agent_assistants')
      .select('id, bot_name, assistant_id')
      .eq('company_id', company_id)
      .single()

    if (assistantError || !assistant) {
      console.error('❌ Assistente não encontrado:', assistantError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Assistente não encontrado: ' + (assistantError?.message || 'Não existe')
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!assistant.assistant_id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Assistant ID não configurado'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log('✅ Assistente encontrado:', assistant.bot_name, assistant.assistant_id)

    // Buscar empresa
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single()

    const companyName = company?.name || 'Estabelecimento'
    const botName = assistant.bot_name || 'Assistente Virtual'
    console.log('✅ Dados da empresa:', { companyName, botName })

    // Preparar instruções
    const instructions = 'Você é ' + botName + ', assistente virtual da ' + companyName + '.\n\n' +
      '🎯 PERSONALIDADE: Simpático, acolhedor e direto\n' +
      '🌍 IDIOMA: Português brasileiro\n\n' +
      '⚡ COMPORTAMENTO:\n' +
      '- Seja útil e educado sempre\n' +
      '- Responda diretamente sobre produtos\n' +
      '- Sugira produtos quando apropriado\n' +
      '- Destaque promoções disponíveis\n' +
      '- Use emojis com moderação\n\n' +
      '🚨 REGRAS CRÍTICAS:\n' +
      '- Mencione o cardápio na saudação inicial e quando solicitado\n' +
      '- Use sempre o link limpo do cardápio quando apropriado\n' +
      '- Evite repetir o link múltiplas vezes na mesma conversa\n' +
      '- Responda com base nas informações que você possui\n' +
      '- Seja proativo em oferecer o cardápio quando relevante\n\n' +
      '📋 MODALIDADES:\n' +
      '- DELIVERY: padrão (sempre perguntar endereço)\n' +
      '- RETIRADA: cliente busca no local\n' +
      '- SALÃO: consumo no estabelecimento\n\n' +
      '✅ DIRETRIZES FINAIS:\n' +
      '- Mantenha foco no atendimento\n' +
      '- Seja proativo em sugestões\n' +
      '- Ofereça alternativas quando necessário\n' +
      '- Use linguagem natural e amigável\n' +
      '- Processe pedidos quando solicitado'

    console.log('✅ Instruções preparadas, tamanho:', instructions.length)

    // Atualizar na OpenAI
    console.log('🔄 Enviando para OpenAI...')
    const openaiResponse = await fetch('https://api.openai.com/v1/assistants/' + assistant.assistant_id, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + openaiKey,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        instructions: instructions,
        name: botName,
        model: 'gpt-4o-mini'
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('❌ Erro OpenAI:', errorText)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Erro OpenAI (' + openaiResponse.status + '): ' + errorText
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const result = await openaiResponse.json()
    console.log('✅ OpenAI atualizado:', result.id)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Assistant sincronizado com sucesso!',
      assistant_id: assistant.assistant_id,
      bot_name: botName,
      company_name: companyName,
      instructions_length: instructions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ ERRO:', error)
    
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