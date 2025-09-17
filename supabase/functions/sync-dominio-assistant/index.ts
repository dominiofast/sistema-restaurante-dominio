const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔥 SINCRONIZAÇÃO URGENTE: Domínio Pizzas')
    
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

    // Importar e conectar Supabase
    const supabaseModule = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = supabaseModule.createClient(supabaseUrl, supabaseKey)

    const companyId = '550e8400-e29b-41d4-a716-446655440001'

    // Buscar assistente
    const { data: assistant, error: assistantError } = await supabase
      .from('ai_agent_assistants')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (assistantError || !assistant) {
      console.error('❌ Assistente não encontrado:', assistantError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Assistente não encontrado'
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Instruções com horários REAIS hardcoded para garantir
    const instructions = `Você é Assistente Domínio Pizzas, assistente virtual especializado da Domínio Pizzas.

🚨 HORÁRIOS DE FUNCIONAMENTO REAIS - NUNCA INVENTE OUTROS:
• Domingo: 17:45 às 23:59
• Segunda: 17:45 às 23:30 
• Terça: 17:45 às 23:30
• Quarta: 10:45 às 23:30
• Quinta: 17:45 às 23:30
• Sexta: 17:45 às 23:30
• Sábado: 17:45 às 23:30

🎯 COMPORTAMENTO:
- Seja amigável e prestativo
- Responda sobre horários EXATAMENTE como listado acima
- JAMAIS invente horários diferentes
- Se perguntarem "vocês estão abertos?", responda com os horários reais
- Use emojis moderadamente

🚫 REGRAS CRÍTICAS:
- NUNCA diga "das 11h às 22h" ou horários inventados
- SEMPRE use os horários exatos listados acima
- Se não souber algo específico, seja honesto

Mantenha foco no atendimento com informações precisas.`

    console.log('✅ Instruções preparadas com horários REAIS')

    // Se tem assistant_id real, atualizar na OpenAI
    if (assistant.assistant_id && assistant.assistant_id !== 'FORCE_DIRECT_MODE') {
      console.log('🔄 Atualizando na OpenAI:', assistant.assistant_id)
      
      const openaiResponse = await fetch('https://api.openai.com/v1/assistants/' + assistant.assistant_id, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + openaiKey,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          instructions: instructions,
          name: assistant.bot_name || 'Assistente Domínio Pizzas',
          model: 'gpt-4o-mini'
        })
      })

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error('❌ Erro OpenAI:', errorText)
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Erro OpenAI: ' + errorText
        }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      console.log('✅ Assistant OpenAI atualizado')
    }

    // Forçar modo direto para garantir que use o prompt atual
    const { error: updateError } = await supabase
      .from('ai_agent_assistants')
      .update({
        use_direct_mode: false, // Desabilitar temporariamente
        updated_at: new Date().toISOString()
      })
      .eq('company_id', companyId)

    if (updateError) {
      console.error('❌ Erro ao atualizar config:', updateError)
    } else {
      console.log('✅ Modo direto temporariamente desabilitado para forçar sincronização')
    }

    // Reabilitar modo direto após 2 segundos
    setTimeout(async () => {
      await supabase
        .from('ai_agent_assistants')
        .update({
          use_direct_mode: true,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId)
      
      console.log('✅ Modo direto reabilitado')
    }, 2000)

    // Log da sincronização
    await supabase
      .from('ai_conversation_logs')
      .insert({
        company_id: companyId,
        customer_phone: 'SYSTEM',
        customer_name: 'ADMIN',
        message_content: 'SINCRONIZAÇÃO FORÇADA: Assistant atualizado com horários reais - Domingo: 17:45-23:59 | Segunda: 17:45-23:30 | Terça: 17:45-23:30 | Quarta: 10:45-23:30 | Quinta: 17:45-23:30 | Sexta: 17:45-23:30 | Sábado: 17:45-23:30',
        message_type: 'assistant_sync_real_hours',
        created_at: new Date().toISOString()
      })

    return new Response(JSON.stringify({ 
      success: true,
      message: '✅ ASSISTANT SINCRONIZADO COM HORÁRIOS REAIS!',
      horarios_aplicados: 'Domingo: 17:45-23:59 | Segunda: 17:45-23:30 | Terça: 17:45-23:30 | Quarta: 10:45-23:30 | Quinta: 17:45-23:30 | Sexta: 17:45-23:30 | Sábado: 17:45-23:30',
      instructions_length: instructions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})