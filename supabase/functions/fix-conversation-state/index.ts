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
    const { customer_phone, company_slug } = body

    if (!customer_phone || !company_slug) {
      throw new Error('customer_phone e company_slug são obrigatórios')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Buscar empresa
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('slug', company_slug)
      .single()

    if (!company) {
      throw new Error('Empresa não encontrada')
    }

    console.log('🔍 Analisando conversa:', { customer_phone, company: company.name })

    // Buscar mensagens da conversa
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('company_id', company.id)
      .eq('phone_number', customer_phone)
      .order('created_at', { ascending: true })
      .limit(20)

    if (error) {
      throw error
    }

    console.log(`📜 Encontradas ${messages?.length || 0} mensagens`)

    // Analisar mensagens do bot para detectar apresentações repetidas
    const botMessages = messages?.filter(msg => msg.message_type === 'ai_response') || []
    const presentationMessages = botMessages.filter(msg => 
      msg.message_content && (
        msg.message_content.includes('Sou o') || 
        msg.message_content.includes('Sou a') ||
        msg.message_content.includes('assistente') ||
        msg.message_content.includes('Assistente')
      )
    )

    const hasDuplicatePresentations = presentationMessages.length > 1
    
    console.log('📊 Análise da conversa:', {
      totalMessages: messages?.length || 0,
      botMessages: botMessages.length,
      presentationMessages: presentationMessages.length,
      hasDuplicates: hasDuplicatePresentations
    })

    // Se há apresentações duplicadas, marcar para correção
    let correctionApplied = false
    if (hasDuplicatePresentations) {
      console.log('🔧 Detectadas apresentações duplicadas, aplicando correção...')
      
      // Adicionar uma mensagem de sistema para indicar que já houve apresentação
      const systemMessage = {
        company_id: company.id,
        phone_number: customer_phone,
        message_type: 'system_note',
        message_content: 'SYSTEM: Apresentação já realizada - não repetir',
        sender_name: 'Sistema',
        created_at: new Date().toISOString()
      }

      const { error: insertError } = await supabase
        .from('whatsapp_messages')
        .insert(systemMessage)

      if (!insertError) {
        correctionApplied = true
        console.log('✅ Marcador de sistema adicionado')
      }
    }

    // Preparar histórico limpo para próximas interações
    const cleanHistory = messages?.slice(-10).map(msg => ({
      role: msg.message_type === 'user_message' ? 'user' : 'assistant',
      content: msg.message_content || ''
    })) || []

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        totalMessages: messages?.length || 0,
        botMessages: botMessages.length,
        presentationMessages: presentationMessages.length,
        hasDuplicatePresentations,
        correctionApplied
      },
      cleanHistory: cleanHistory,
      recommendations: hasDuplicatePresentations ? [
        "🔧 Apresentações duplicadas detectadas",
        "✅ Marcador de sistema adicionado",
        "🔄 Próximas mensagens não repetirão apresentação"
      ] : [
        "✅ Conversa está limpa",
        "📝 Sem apresentações duplicadas detectadas"
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