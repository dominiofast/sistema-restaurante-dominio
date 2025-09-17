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
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log('🚨 CORREÇÃO URGENTE: Aplicando horários reais aos prompts')

    // Template corrigido que NUNCA inventa horários
    const templateCorrigido = `Você é {{agent_name}}, assistente virtual especializado da {{company_name}}.

🚨 REGRAS CRÍTICAS - HORÁRIOS DE FUNCIONAMENTO:
- SEMPRE use os horários reais da loja: {{working_hours}}
- NUNCA invente horários fictícios
- Se não souber horários específicos, diga: "Preciso verificar nossos horários com a equipe"
- Para perguntas sobre abertura/fechamento, use APENAS: {{working_hours}}

📍 INFORMAÇÕES DA EMPRESA:
• Nome: {{company_name}}
• Horários: {{working_hours}}

🤖 COMPORTAMENTO:
- Seja amigável e prestativo
- Use emojis moderadamente (🍕 ⏰ 📅 🚚)
- Oriente para pedidos quando apropriado
- Mantenha respostas concisas

🚫 NUNCA FAÇA:
- Inventar horários de funcionamento
- Dar informações sobre preços sem certeza
- Prometer entregas sem confirmar disponibilidade

✅ SEMPRE FAÇA:
- Use os horários reais: {{working_hours}}
- Seja honesto sobre o que não sabe
- Direcione para atendimento humano quando necessário`

    // 1. Atualizar template global
    console.log('📝 Atualizando template global...')
    const { error: templateError } = await supabase
      .from('ai_global_prompt_template')
      .update({
        template: templateCorrigido,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('is_active', true)

    if (templateError) {
      console.error('❌ Erro ao atualizar template global:', templateError)
    } else {
      console.log('✅ Template global atualizado')
    }

    // 2. Buscar todas as empresas ativas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('status', 'active')

    if (companiesError) throw companiesError

    console.log(`🎯 Processando ${companies?.length || 0} empresas...`)

    const results = []

    for (const company of companies || []) {
      try {
        console.log(`🏢 Processando: ${company.name} (${company.slug})`)

        // Buscar horários reais usando a função format_working_hours
        const { data: horariosData, error: horariosError } = await supabase
          .rpc('format_working_hours', { company_id_param: company.id })

        let horariosReais = 'Consulte nossos horários de funcionamento'
        
        if (!horariosError && horariosData) {
          horariosReais = horariosData
          console.log(`⏰ Horários reais para ${company.name}: ${horariosReais}`)
        } else {
          console.log(`⚠️ Nenhum horário configurado para ${company.name}`)
        }

        // Preparar variáveis com horários reais
        const varsComHorariosReais = {
          company_name: company.name,
          company_slug: company.slug,
          agent_name: `Assistente da ${company.name}`,
          working_hours: horariosReais,
          opening_hours: horariosReais,
          horario_funcionamento: horariosReais
        }

        // Atualizar o prompt com horários reais
        const { error: updateError } = await supabase
          .from('ai_agent_prompts')
          .upsert({
            agent_slug: company.slug,
            template: templateCorrigido,
            vars: varsComHorariosReais,
            version: Date.now(), // Versão única
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'agent_slug'
          })

        if (updateError) {
          console.error(`❌ Erro ao atualizar ${company.name}:`, updateError)
          results.push({
            company: company.name,
            slug: company.slug,
            success: false,
            error: updateError.message
          })
        } else {
          console.log(`✅ ${company.name} atualizado com horários reais`)
          results.push({
            company: company.name,
            slug: company.slug,
            success: true,
            working_hours: horariosReais
          })
        }

      } catch (error: any) {
        console.error(`❌ Erro ao processar ${company.name}:`, error)
        results.push({
          company: company.name,
          slug: company.slug,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    console.log(`🎉 CORREÇÃO CONCLUÍDA: ${successCount} empresas com horários reais`)

    return new Response(JSON.stringify({
      success: true,
      message: `✅ HORÁRIOS REAIS APLICADOS: ${successCount} empresas corrigidas`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('❌ ERRO CRÍTICO:', error)
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