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
    const { companiesToUpdate = 'all' } = body

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log('🚀 Aplicando template global com horários reais...')

    // Buscar o template global ativo
    const { data: globalTemplate, error: templateError } = await supabase
      .from('ai_global_prompt_template')
      .select('*')
      .eq('is_active', true)
      .single()

    if (templateError || !globalTemplate) {
      throw new Error('Template global não encontrado ou inativo')
    }

    // Buscar empresas
    let companiesQuery = supabase
      .from('companies')
      .select('id, name, slug, status')
      .eq('status', 'active')

    if (companiesToUpdate !== 'all' && Array.isArray(companiesToUpdate)) {
      companiesQuery = companiesQuery.in('slug', companiesToUpdate)
    }

    const { data: companies, error: companiesError } = await companiesQuery

    if (companiesError) throw companiesError

    console.log(`📋 Processando ${companies?.length || 0} empresas...`)

    const results = []

    for (const company of companies || []) {
      try {
        console.log(`🏢 Processando empresa: ${company.name} (${company.slug})`)

        // Buscar horários reais da empresa usando a função format_working_hours
        const { data: horariosData, error: horariosError } = await supabase
          .rpc('format_working_hours', { company_id_param: company.id })

        let horariosFormatados = 'Consulte nossos horários de funcionamento'
        
        if (!horariosError && horariosData) {
          horariosFormatados = horariosData
          console.log(`⏰ Horários encontrados para ${company.name}: ${horariosFormatados}`)
        } else {
          console.log(`⚠️ Horários não encontrados para ${company.name}, usando padrão`)
        }

        // Preparar variáveis dinâmicas
        const dynamicVars = {
          ...globalTemplate.default_vars,
          company_name: company.name,
          company_slug: company.slug,
          agent_name: `Assistente da ${company.name}`,
          working_hours: horariosFormatados,
          opening_hours: horariosFormatados,
          horario_funcionamento: horariosFormatados
        }

        // Upsert do prompt atualizado com horários reais
        const { error: upsertError } = await supabase
          .from('ai_agent_prompts')
          .upsert({
            agent_slug: company.slug,
            template: globalTemplate.template,
            vars: dynamicVars,
            version: (globalTemplate.version || 1) + 1,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'agent_slug'
          })

        if (upsertError) {
          console.error(`❌ Erro ao atualizar prompt da empresa ${company.name}:`, upsertError)
          results.push({
            company: company.name,
            slug: company.slug,
            success: false,
            error: upsertError.message
          })
        } else {
          console.log(`✅ Prompt atualizado com sucesso para ${company.name}`)
          results.push({
            company: company.name,
            slug: company.slug,
            success: true,
            working_hours: horariosFormatados
          })
        }

      } catch (companyError: any) {
        console.error(`❌ Erro ao processar empresa ${company.name}:`, companyError)
        results.push({
          company: company.name,
          slug: company.slug,
          success: false,
          error: companyError.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(`📊 Resumo: ${successCount} sucessos, ${failureCount} falhas`)

    return new Response(JSON.stringify({
      success: true,
      message: `Template aplicado com horários reais: ${successCount} sucessos, ${failureCount} falhas`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
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