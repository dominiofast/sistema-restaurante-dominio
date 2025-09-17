import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CardapioItem {
  name: string;
  description?: string;
  price: number;
  category?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { companyId, customerInfo, isFirstMessage } = await req.json()

    // Se não for primeira mensagem, retorna null
    if (!isFirstMessage) {
      return new Response(
        JSON.stringify({ welcomeMessage: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Gerando mensagem de boas-vindas para:', { companyId, customerInfo })

    // Carregar configuração do agente IA
    const { data: agentConfig, error: agentError } = await supabase
      .from('agente_ia_config')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (agentError || !agentConfig || !agentConfig.ativo) {
      console.log('Agente IA não configurado ou inativo para empresa:', companyId)
      return new Response(
        JSON.stringify({ welcomeMessage: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Carregar configuração global de IA
    const { data: globalConfig, error: globalError } = await supabase
      .from('ai_global_config')
      .select('*')
      .eq('is_active', true)
      .single()

    if (globalError || !globalConfig) {
      console.log('Configuração global de IA não encontrada')
      return new Response(
        JSON.stringify({ welcomeMessage: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Carregar dados da empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name, slug, domain')
      .eq('id', companyId)
      .single()

    if (companyError) {
      console.error('Erro ao carregar dados da empresa:', companyError)
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Construir URL do cardápio limpa
    const cleanSlug = company.slug || company.domain || '';
    const cardapioUrl = `https://pedido.dominio.tech/${cleanSlug}`.replace(/[^\x20-\x7E]/g, '').trim()

    let cardapioText = ''

    // Carregar cardápio se conhecimento de produtos estiver ativo
    if (agentConfig.conhecimento_produtos) {
      console.log('Carregando cardápio para mensagem de boas-vindas...')
      
      // Buscar categorias e produtos
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select(`
          id,
          name,
          produtos!inner (
            id,
            name,
            description,
            price,
            is_available
          )
        `)
        .eq('company_id', companyId)
        .eq('produtos.is_available', true)
        .order('display_order', { ascending: true })

      if (!categoriasError && categorias && categorias.length > 0) {
        cardapioText = '\n\n📋 **NOSSO CARDÁPIO:**\n\n'
        
        categorias.forEach((categoria: any) => {
          if (categoria.produtos && categoria.produtos.length > 0) {
            cardapioText += `**${categoria.name.toUpperCase()}**\n`
            
            categoria.produtos.slice(0, 5).forEach((produto: any) => {
              cardapioText += `• ${produto.name} - R$ ${produto.price.toFixed(2).replace('.', ',')}\n`
              if (produto.description) {
                cardapioText += `  ${produto.description}\n`
              }
            })
            
            if (categoria.produtos.length > 5) {
              cardapioText += `  ... e mais ${categoria.produtos.length - 5} opções!\n`
            }
            
            cardapioText += '\n'
          }
        })
      }
    }

    // Construir prompt para OpenAI - LIMPO como Anota.ai
    const welcomePrompt = `
Você é ${agentConfig.nome}, atendente virtual da ${company.name}.

INSTRUÇÕES PARA MENSAGEM LIMPA:
- Cumprimente ${customerInfo.name} de forma calorosa com emoji 👋
- Apresente-se brevemente como ${agentConfig.nome}
- Mencione a ${company.name} com emoji apropriado (🍕 para pizzaria, 🍔 para hamburguer, etc.)
- Inclua o link do cardápio apenas no final: ${cardapioUrl}
- Use no máximo 3 linhas de texto
- Seja EXTREMAMENTE CONCISO - máximo 80 palavras
- NÃO inclua textos explicativos ou descrições longas
- Use o estilo do Anota.ai: direto, limpo e amigável

PERSONALIDADE: ${agentConfig.personalidade === 'simpatico' ? 'Caloroso e amigável' : 
  agentConfig.personalidade === 'profissional' ? 'Formal e direto' :
  agentConfig.personalidade === 'vendedor' ? 'Persuasivo' :
  agentConfig.personalidade === 'consultivo' ? 'Educativo' :
  'Descontraído'}

Gere apenas a mensagem, sem explicações adicionais.
`

    // Chamar OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: globalConfig.openai_model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: globalConfig.system_prompt || 'Você é um assistente útil e prestativo.'
          },
          {
            role: 'user',
            content: welcomePrompt
          }
        ],
        max_tokens: globalConfig.max_tokens || 500,
        temperature: globalConfig.temperature || 0.7
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro na API OpenAI:', error)
      
      // Fallback com link de cardápio
      const fallbackMessage = `Olá! Sou o Atendente Virtual da ${company.name} 🍕. Como posso ajudar você hoje?\n\n🍽️ Confira nosso cardápio: ${cardapioUrl}`
      
      return new Response(
        JSON.stringify({ welcomeMessage: fallbackMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const welcomeMessage = data.choices[0].message.content

    console.log('Mensagem de boas-vindas gerada:', welcomeMessage)

    return new Response(
      JSON.stringify({ welcomeMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao gerar mensagem de boas-vindas:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})