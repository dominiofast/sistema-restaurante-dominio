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
    console.log('🆕 CRIAR NOVO ASSISTANT - Iniciando')
    
    const { company_id, slug } = await req.json()
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

    // Conectar Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase conectado')

    // Buscar assistente existente
    const { data: assistant } = await supabase
      .from('ai_agent_assistants')
      .select('id, bot_name, assistant_id')
      .eq('company_id', company_id)
      .single()

    // Buscar empresa
    const { data: company } = await supabase
      .from('companies')
      .select('name, slug')
      .eq('id', company_id)
      .single()

    const companyName = company?.name || 'Estabelecimento'
    const botName = assistant?.bot_name || `Assistente ${companyName}`
    const companySlug = company?.slug || slug
    
    console.log('✅ Dados da empresa:', { companyName, botName, companySlug })

    // Criar instruções LIMPAS
    const instructions = `Você é ${botName}, assistente virtual especializado em atendimento ao cliente.

🏢 EMPRESA: ${companyName}
📱 ATENDIMENTO: Delivery, Retirada no local, Salão

🎯 PERSONALIDADE: Simpático, acolhedor e direto
🌍 IDIOMA: Português brasileiro
💬 SAUDAÇÃO: "Olá! Sou o ${botName} da ${companyName}! 🍕"

⚡ COMPORTAMENTO:
- Seja útil e educado sempre
- Responda diretamente sobre produtos
- Sugira produtos quando apropriado
- Destaque promoções disponíveis
- Use emojis com moderação
- NÃO se identifique novamente após a primeira mensagem

🚨 REGRAS CRÍTICAS - LINK DO CARDÁPIO:
- O ÚNICO link permitido para o cardápio é: https://pedido.dominio.tech/${companySlug}
- NUNCA usar outros domínios, sites ou links diferentes
- NUNCA inventar URLs com outros domínios como .com.br ou similares
- NUNCA criar links fictícios ou alternativos
- SEMPRE usar exatamente o formato: https://pedido.dominio.tech/${companySlug}
- NUNCA adicionar caracteres especiais, pontos ou símbolos após o link
- Mencione o cardápio na saudação inicial e quando solicitado
- Evite repetir o link múltiplas vezes na mesma conversa
- Responda com base nas informações que você possui
- Seja proativo em oferecer o cardápio quando relevante

📋 MODALIDADES:
- DELIVERY: padrão (sempre perguntar endereço)
- RETIRADA: cliente busca no local
- SALÃO: consumo no estabelecimento

✅ DIRETRIZES FINAIS:
- Mantenha foco no atendimento
- Seja proativo em sugestões
- Ofereça alternativas quando necessário
- Use linguagem natural e amigável
- Processe pedidos quando solicitado`

    console.log('✅ Instruções preparadas LIMPAS, tamanho:', instructions.length)

    // Primeiro, deletar o assistant antigo corrompido se existir
    if (assistant?.assistant_id) {
      console.log('🗑️ Deletando assistant corrompido:', assistant.assistant_id)
      try {
        await fetch(`https://api.openai.com/v1/assistants/${assistant.assistant_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + openaiKey,
            'OpenAI-Beta': 'assistants=v2'
          }
        })
        console.log('✅ Assistant corrompido deletado')
      } catch (error) {
        console.log('⚠️ Erro ao deletar assistant antigo:', error.message)
      }
    }

    // Criar NOVO assistant na OpenAI
    console.log('🆕 Criando NOVO assistant na OpenAI...')
    const createResponse = await fetch('https://api.openai.com/v1/assistants', {
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

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('❌ Erro ao criar novo assistant:', errorText)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Erro OpenAI ao criar (' + createResponse.status + '): ' + errorText
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const newAssistant = await createResponse.json()
    console.log('✅ NOVO Assistant criado:', newAssistant.id)

    // Atualizar o banco com o novo assistant_id
    const { error: updateError } = await supabase
      .from('ai_agent_assistants')
      .update({ 
        assistant_id: newAssistant.id,
        updated_at: new Date().toISOString()
      })
      .eq('company_id', company_id)

    if (updateError) {
      console.error('❌ Erro ao atualizar banco:', updateError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Erro ao atualizar banco: ' + updateError.message
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log('✅ Banco atualizado com novo assistant_id')

    return new Response(JSON.stringify({ 
      success: true,
      message: 'NOVO Assistant criado com sucesso! Assistant corrompido foi removido.',
      old_assistant_id: assistant?.assistant_id || 'nenhum',
      new_assistant_id: newAssistant.id,
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