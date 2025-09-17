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
    console.log('🚨 EMERGENCY ASSISTANT NEUTRALIZER - Neutralizando Assistant OpenAI')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Buscar assistant do Domínio Pizzas
    const { data: assistant } = await supabase
      .from('ai_agent_assistants')
      .select('assistant_id, bot_name')
      .eq('company_id', '550e8400-e29b-41d4-a716-446655440001')
      .single()

    if (!assistant?.assistant_id) {
      throw new Error('Assistant ID não encontrado')
    }

    console.log('🎯 Assistant encontrado:', assistant.assistant_id)

    // PROMPT NEUTRO - SEM APRESENTAÇÃO
    const neutralPrompt = `Você é um assistente de atendimento. Responda APENAS à pergunta feita.

REGRA CRÍTICA: NUNCA se apresente ou diga seu nome. Responda diretamente.

Para pedidos: "Acesse o cardápio: https://pedido.dominio.tech/dominiopizzas"
Para dúvidas sobre produtos: "Consulte o cardápio para detalhes."
Para qualquer coisa: seja direto, objetivo e útil.

NÃO diga "Olá! Sou o..." ou qualquer apresentação.`

    // Atualizar na OpenAI
    console.log('🔄 Atualizando Assistant na OpenAI...')
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const response = await fetch(`https://api.openai.com/v1/assistants/${assistant.assistant_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        instructions: neutralPrompt,
        name: 'Neutro-Bot',
        model: 'gpt-4o-mini'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Assistant neutralizado:', result.id)

    // Log da neutralização
    await supabase
      .from('ai_conversation_logs')
      .insert({
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        customer_phone: 'SYSTEM',
        customer_name: 'NEUTRALIZER',
        message_content: `Assistant ${assistant.assistant_id} NEUTRALIZADO - Prompt sem apresentação aplicado`,
        message_type: 'assistant_neutralized',
        created_at: new Date().toISOString()
      })

    return new Response(JSON.stringify({
      success: true,
      message: 'Assistant neutralizado com sucesso!',
      assistant_id: assistant.assistant_id,
      old_name: assistant.bot_name,
      new_name: 'Neutro-Bot',
      action: 'NEUTRALIZED - Sem apresentações'
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