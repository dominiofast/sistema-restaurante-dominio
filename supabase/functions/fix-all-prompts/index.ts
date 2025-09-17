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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔧 CORREÇÃO EM MASSA: Atualizando prompts de todas as empresas')

    // Buscar todas as empresas ativas com slug
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('status', 'active')
      .not('slug', 'is', null)

    if (companiesError) {
      throw new Error(`Erro ao buscar empresas: ${companiesError.message}`)
    }

    console.log(`🏢 Encontradas ${companies.length} empresas ativas`)

    let updatedCount = 0
    let createdCount = 0
    const results = []

    for (const company of companies) {
      try {
        console.log(`🔄 Processando: ${company.name} (${company.slug})`)

        // Verificar se já existe prompt
        const { data: existingPrompt } = await supabase
          .from('ai_agent_prompts')
          .select('*')
          .eq('agent_slug', company.slug)
          .single()

        const templateWithLink = `Você é um assistente virtual especializado em atendimento ao cliente para {{company_name}}.

🚨 REGRAS CRÍTICAS - HORÁRIOS DE FUNCIONAMENTO:
- SEMPRE use os horários reais da loja: {{working_hours}}
- NUNCA invente horários fictícios
- Se não souber horários específicos, diga: "Preciso verificar nossos horários com a equipe"

📍 INFORMAÇÕES DA EMPRESA:
• Nome: {{company_name}}
• Horários: {{working_hours}}

🍽️ CARDÁPIO E PEDIDOS:
• Para visualizar nosso cardápio completo, acesse: {{cardapio_url}}
• Quando o cliente perguntar sobre cardápio, preços, produtos ou quiser fazer pedidos, SEMPRE forneça o link: {{cardapio_url}}

💰 FORMAS DE PAGAMENTO:
{{payment_methods}}

🤖 COMPORTAMENTO:
- Seja amigável e prestativo
- Use emojis moderadamente (🍕 ⏰ 📅 🚚)
- Oriente para pedidos quando apropriado
- Mantenha respostas concisas
- SEMPRE inclua o link do cardápio quando relevante

🚫 NUNCA FAÇA:
- Inventar horários de funcionamento
- Dar informações sobre preços sem certeza
- Prometer entregas sem confirmar disponibilidade

✅ SEMPRE FAÇA:
- Use os horários reais: {{working_hours}}
- Seja honesto sobre o que não sabe
- Direcione para o cardápio: {{cardapio_url}}
- Ofereça ajuda para fazer pedidos`

        const varsWithLink = {
          company_name: company.name,
          company_slug: company.slug,
          business_type: 'Restaurante',
          cardapio_url: `https://pedido.dominio.tech/${company.slug}`,
          working_hours: 'Segunda a Domingo das 18h às 23h',
          payment_methods: 'Aceitamos: PIX, Dinheiro, Cartão de Débito e Crédito (Visa, Mastercard, Elo)'
        }

        if (existingPrompt) {
          // Verificar se precisa atualizar
          const hasLink = existingPrompt.template?.includes('cardapio_url') || 
                         existingPrompt.vars?.cardapio_url

          if (!hasLink) {
            // Atualizar prompt existente
            const { error: updateError } = await supabase
              .from('ai_agent_prompts')
              .update({
                template: templateWithLink,
                vars: varsWithLink,
                updated_at: new Date().toISOString()
              })
              .eq('agent_slug', company.slug)

            if (updateError) {
              console.error(`❌ Erro ao atualizar ${company.slug}:`, updateError)
              results.push({ company: company.name, status: 'ERRO', details: updateError.message })
            } else {
              updatedCount++
              results.push({ company: company.name, status: 'ATUALIZADO', details: 'Link adicionado ao prompt existente' })
              console.log(`✅ Atualizado: ${company.name}`)
            }
          } else {
            results.push({ company: company.name, status: 'JÁ OK', details: 'Prompt já tem link do cardápio' })
            console.log(`ℹ️ Já OK: ${company.name}`)
          }
        } else {
          // Criar novo prompt
          const { error: insertError } = await supabase
            .from('ai_agent_prompts')
            .insert({
              agent_slug: company.slug,
              template: templateWithLink,
              vars: varsWithLink
            })

          if (insertError) {
            console.error(`❌ Erro ao criar prompt para ${company.slug}:`, insertError)
            results.push({ company: company.name, status: 'ERRO', details: insertError.message })
          } else {
            createdCount++
            results.push({ company: company.name, status: 'CRIADO', details: 'Novo prompt criado com link' })
            console.log(`🆕 Criado: ${company.name}`)
          }
        }

      } catch (error) {
        console.error(`❌ Erro processando ${company.name}:`, error)
        results.push({ company: company.name, status: 'ERRO', details: error.message })
      }
    }

    console.log(`✅ CORREÇÃO CONCLUÍDA: ${updatedCount} atualizados, ${createdCount} criados`)

    return new Response(JSON.stringify({
      success: true,
      message: `Correção em massa concluída!`,
      summary: {
        total_companies: companies.length,
        updated: updatedCount,
        created: createdCount,
        already_ok: results.filter(r => r.status === 'JÁ OK').length,
        errors: results.filter(r => r.status === 'ERRO').length
      },
      details: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro na correção em massa:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})