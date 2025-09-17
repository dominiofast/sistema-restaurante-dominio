import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== SYNC ASSISTANT V3 FUNCTION CALLED ===')
    
    const body = await req.json()
    console.log('Request body:', JSON.stringify(body, null, 2))

    const { company_id, slug } = body

    if (!company_id || !slug) {
      throw new Error('Parâmetros company_id e slug são obrigatórios')
    }

    // Verificar variáveis de ambiente
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('Environment check:', {
      OPENAI_API_KEY: OPENAI_API_KEY ? 'OK' : 'MISSING',
      SUPABASE_URL: SUPABASE_URL ? 'OK' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'
    })

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Configurações do Supabase não encontradas')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Buscar dados do assistente
    console.log('Buscando assistente para company_id:', company_id)
    const { data: assistant, error: assistantError } = await supabase
      .from('ai_agent_assistants')
      .select('*')
      .eq('company_id', company_id)
      .single()

    if (assistantError) {
      console.error('Erro ao buscar assistente:', assistantError)
      throw new Error(`Assistente não encontrado: ${assistantError.message}`)
    }

    if (!assistant) {
      throw new Error('Assistente não encontrado na base de dados')
    }

    console.log('Assistente encontrado:', {
      id: assistant.id,
      bot_name: assistant.bot_name,
      assistant_id: assistant.assistant_id
    })

    if (!assistant.assistant_id) {
      throw new Error('Assistant ID não configurado no banco de dados')
    }

    // Buscar empresa para nome
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single()

    const companyName = company?.name || 'Estabelecimento'
    const botName = assistant.bot_name || 'Assistente Virtual'
    
    console.log('Dados da empresa:', { companyName, botName })

    // Criar prompt simples e direto
    const instructions = `Você é ${botName}, assistente virtual da ${companyName}.

🎯 PERSONALIDADE: Simpático, acolhedor e direto
🌍 IDIOMA: Português brasileiro

⚡ COMPORTAMENTO:
- Seja útil e educado sempre
- Responda diretamente sobre produtos
- Sugira produtos quando apropriado
- Destaque promoções disponíveis
- Use emojis com moderação

🚨 REGRAS CRÍTICAS:
- Mencione o cardápio na saudação inicial e quando solicitado
- Use sempre o link limpo do cardápio quando apropriado
- Evite repetir o link múltiplas vezes na mesma conversa
- Responda com base nas informações que você possui
- Seja proativo em oferecer o cardápio quando relevante

📋 MODALIDADES:
- DELIVERY: padrão (sempre perguntar endereço)
- RETIRADA: cliente busca no local
- SALÃO: consumo no estabelecimento

🍽️ INSTRUÇÕES DE ATENDIMENTO:
- Use APENAS as informações dos produtos para responder
- Sempre mencione preços exatos quando relevante
- Para produtos com opções, explique todas as escolhas disponíveis
- Calcule totais corretamente incluindo adicionais
- Se produto não estiver listado, informe que não está disponível
- Destaque ofertas especiais quando houver

✅ DIRETRIZES FINAIS:
- Mantenha foco no atendimento
- Seja proativo em sugestões
- Ofereça alternativas quando necessário
- Use linguagem natural e amigável
- Processe pedidos quando solicitado`

    console.log('Instruções preparadas:', {
      length: instructions.length,
      preview: instructions.substring(0, 100) + '...'
    })

    // Atualizar assistente na OpenAI
    console.log(`🔄 Enviando para OpenAI - Assistant ID: ${assistant.assistant_id}`)
    
    const openaiResponse = await fetch(`https://api.openai.com/v1/assistants/${assistant.assistant_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        instructions: instructions,
        name: botName,
        model: 'gpt-4o-mini'
      })
    })

    console.log('OpenAI Response Status:', openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('Erro da OpenAI:', errorText)
      throw new Error(`Erro da OpenAI (${openaiResponse.status}): ${errorText}`)
    }

    const openaiResult = await openaiResponse.json()
    console.log('✅ Resposta da OpenAI:', {
      id: openaiResult.id,
      name: openaiResult.name,
      model: openaiResult.model
    })

    console.log('✅ Assistente sincronizado com sucesso!')

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Assistente sincronizado com sucesso!',
      assistant_id: assistant.assistant_id,
      bot_name: botName,
      company_name: companyName,
      instructions_length: instructions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ ERRO COMPLETO:', error)
    console.error('❌ ERRO MESSAGE:', error.message)
    console.error('❌ ERRO STACK:', error.stack)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})