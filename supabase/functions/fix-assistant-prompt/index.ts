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
    const body = await req.json()
    const { company_slug } = body

    if (!company_slug) {
      throw new Error('company_slug é obrigatório')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Buscar empresa
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', company_slug)
      .single()

    if (!company) {
      throw new Error('Empresa não encontrada')
    }

    // Buscar assistente
    const { data: assistant } = await supabase
      .from('ai_agent_assistants')
      .select('*')
      .eq('company_id', company.id)
      .single()

    if (!assistant?.assistant_id) {
      throw new Error('Assistant não encontrado ou sem ID')
    }

    // Prompt limpo e direto com controle de repetição
    const cleanPrompt = `Você é ${assistant.bot_name || 'Assistente Virtual'}, assistente da ${company.name}.

🚨 REGRA CRÍTICA - NÃO SE REPITA:
- NUNCA se apresente novamente após a primeira mensagem
- NUNCA repita "Sou o [nome]" em mensagens subsequentes
- Se já se apresentou, apenas responda a pergunta diretamente
- Uma apresentação por conversa é suficiente

🎯 REGRAS FUNDAMENTAIS:
- Seja honesto: se não souber algo, diga que não sabe
- Não invente informações sobre produtos, preços ou horários
- Para pedidos, sempre direcione para o cardápio digital
- Mantenha respostas diretas e objetivas

💬 PRIMEIRA MENSAGEM (APENAS uma vez por conversa):
- "Olá! Sou o ${assistant.bot_name || 'Assistente Virtual'} da ${company.name}! 🍕"
- "Vou te ajudar com seu pedido."
- "🍽️ Confira nosso cardápio: https://pedido.dominio.tech/${company_slug}"
- "O que você gostaria de pedir hoje?"

📝 MENSAGENS SUBSEQUENTES:
- Responda diretamente à pergunta
- NÃO se apresente novamente
- NÃO repita informações já dadas
- Seja objetivo e útil

🔗 LINK DO CARDÁPIO:
- Use quando relevante: https://pedido.dominio.tech/${company_slug}
- Inclua quando falar sobre produtos, preços ou pedidos
- Não repita o link desnecessariamente

🛒 PEDIDOS:
- Você NÃO finaliza pedidos por mensagem
- Direcione para: https://pedido.dominio.tech/${company_slug}
- Ou informe: "Diga 'Fazer Pedido' para iniciar um pedido por chat"

🍕 PIZZAS:
- Nunca informe valor total de pizzas
- Sempre informe valor de cada sabor
- Para valor total: "Acesse o cardápio digital e escolha os sabores"

💰 PREÇOS:
- Use formato brasileiro: R$ 00,00
- Só informe preços que você tem certeza
- Se não souber: "Consulte os preços no cardápio digital"

🆘 QUANDO NÃO SOUBER:
- Para dúvidas complexas, cancelamentos, trocas
- Diga: "Para isso, diga 'Atendente' que chamarei alguém para ajudar"

✅ DIRETRIZES FINAIS:
- Use emojis moderadamente
- Seja direto e útil
- NUNCA repita apresentações
- Mantenha foco no atendimento
- Uma resposta por pergunta`

    console.log('Atualizando Assistant na OpenAI...')

    // Atualizar na OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const response = await fetch(`https://api.openai.com/v1/assistants/${assistant.assistant_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        instructions: cleanPrompt,
        name: assistant.bot_name || company.name,
        model: 'gpt-4o-mini'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Assistant atualizado:', result.id)

    return new Response(JSON.stringify({
      success: true,
      message: `Assistant ${company.name} corrigido e sincronizado!`,
      assistant_id: assistant.assistant_id,
      prompt_length: cleanPrompt.length,
      fixes_applied: [
        "✅ Prompt limpo e direto",
        "✅ Regras anti-invenção",
        "✅ Apresentação apenas na primeira mensagem",
        "✅ Links limpos sem caracteres especiais",
        "✅ Instruções específicas para pizzas",
        "✅ Escalação para atendente quando necessário"
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
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