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
    const { slug_empresa, user_message, historico } = await req.json()

    console.log('🚨 EMERGENCY NO-REPEAT - Interceptando repetição')

    // 🚫 VERIFICAÇÃO DE EMERGÊNCIA GLOBAL
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: emergencyBlock } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'emergency_block_legacy_ai')
      .single()

    if (emergencyBlock?.value === 'true') {
      console.log('🚫 [EMERGENCY] Todas as funções legadas bloqueadas');
      return new Response(JSON.stringify({ 
        resposta: "Sistema em manutenção. Tente novamente em alguns minutos.",
        blocked: true,
        emergency_active: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verificar se já houve apresentação
    const hasWelcomeInHistory = historico && historico.some((msg: any) => {
      const content = msg.content || msg.message || '';
      return msg.role === 'assistant' && (
        content.includes('Sou o') || 
        content.includes('Sou a') ||
        content.includes('assistente') ||
        content.includes('Assistente') ||
        content.includes('Olá! Sou')
      );
    });

    if (!hasWelcomeInHistory) {
      // Se não houve apresentação, permitir apresentação normal
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const { data: company } = await supabase
        .from('companies')
        .select('name, slug')
        .eq('slug', slug_empresa)
        .single()

      // 🚨 VERIFICAR MODO DIRETO ANTES DE PROCESSAR
      const { data: assistantConfig } = await supabase
        .from('ai_agent_assistants')
        .select('use_direct_mode, bot_name')
        .eq('company_id', company?.id)
        .single()

      if (assistantConfig?.use_direct_mode === true) {
        console.log('🚫 [EMERGENCY-NO-REPEAT] BLOQUEADO - Modo direto ativo');
        return new Response(JSON.stringify({ 
          resposta: "Modo direto ativo - função emergency bloqueada",
          blocked: true,
          redirect_to_direct: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const botName = assistantConfig?.bot_name || `Assistente ${company?.name}`
      const companyName = company?.name || slug_empresa
      const cardapioUrl = `https://pedido.dominio.tech/${slug_empresa}`

      const welcomeMessage = `Olá! Sou o ${botName} da ${companyName}! 🍕

Vou te ajudar com o seu pedido.

🍽️ Confira nosso cardápio: ${cardapioUrl}

O que você gostaria de pedir hoje?`

      return new Response(JSON.stringify({ 
        resposta: welcomeMessage,
        source: 'emergency_welcome'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Se já houve apresentação, resposta direta sem apresentação
    const directResponses = {
      'cardápio': `Acesse nosso cardápio: https://pedido.dominio.tech/${slug_empresa}`,
      'menu': `Confira nosso menu: https://pedido.dominio.tech/${slug_empresa}`,
      'promoção': `Para ver nossas promoções atuais, acesse: https://pedido.dominio.tech/${slug_empresa}`,
      'preço': `Consulte todos os preços no cardápio: https://pedido.dominio.tech/${slug_empresa}`,
      'pizza': `Veja todas as opções de pizza no cardápio: https://pedido.dominio.tech/${slug_empresa}`,
      'entrega': `Compartilhe sua localização para verificar se entregamos na sua região e saber o valor da entrega.`,
      'horário': `Consulte nossos horários de funcionamento no cardápio digital.`,
      'pedido': `Para fazer um pedido, acesse: https://pedido.dominio.tech/${slug_empresa} ou diga "Fazer Pedido" para iniciar por aqui.`
    }

    // Encontrar resposta apropriada
    const userLower = user_message.toLowerCase()
    let response = ''

    for (const [keyword, answer] of Object.entries(directResponses)) {
      if (userLower.includes(keyword)) {
        response = answer
        break
      }
    }

    // Resposta padrão se não encontrou palavra-chave específica
    if (!response) {
      response = `Para mais informações, consulte nosso cardápio: https://pedido.dominio.tech/${slug_empresa}

Ou diga "Fazer Pedido" para iniciar um pedido por chat.`
    }

    console.log('✅ Resposta direta sem repetição:', response)

    return new Response(JSON.stringify({ 
      resposta: response,
      source: 'emergency_direct'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})