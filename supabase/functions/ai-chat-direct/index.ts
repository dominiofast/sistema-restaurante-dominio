import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para calcular status de funcionamento em tempo real
async function getOperatingStatus(supabase: any, companyId: string): Promise<{
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
  debugInfo?: any;
}> {
  try {
    console.log('🕐 Calculando status para empresa:', companyId);
    
    // Buscar configuração de horários da empresa
    const { data: horarioConfig, error: horarioError } = await supabase
      .from('horario_funcionamento')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (!horarioConfig) {
      return {
        isOpen: false,
        message: 'Horários não configurados',
        debugInfo: { error: 'No horario config found' }
      };
    }

    // Se sempre disponível
    if (horarioConfig.tipo_disponibilidade === 'sempre') {
      return {
        isOpen: true,
        message: 'Sempre aberto - 24 horas por dia'
      };
    }

    // Se fechado permanentemente
    if (horarioConfig.tipo_disponibilidade === 'fechado') {
      return {
        isOpen: false,
        message: 'Fechado temporariamente'
      };
    }

    // Para horários específicos
    if (horarioConfig.tipo_disponibilidade === 'especificos') {
      const fusoHorario = horarioConfig.fuso_horario || 'America/Sao_Paulo';
      const now = new Date();
      
      // Conversão para fuso horário brasileiro
      const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: fusoHorario}));
      const currentDayOfWeek = timeInTimezone.getDay(); // 0 = Domingo, 1 = Segunda, etc.
      const currentTimeString = timeInTimezone.toTimeString().slice(0, 5); // HH:MM
      
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      
      console.log('🕐 DEBUG HORÁRIO:', {
        currentDayOfWeek,
        nomeDia: diasSemana[currentDayOfWeek],
        currentTimeString,
        fusoHorario
      });

      // Buscar horários para hoje
      const { data: todaySchedules, error: scheduleError } = await supabase
        .from('horarios_dias')
        .select('*')
        .eq('horario_funcionamento_id', horarioConfig.id)
        .eq('dia_semana', currentDayOfWeek)
        .eq('ativo', true);

      if (!todaySchedules || todaySchedules.length === 0) {
        return {
          isOpen: false,
          message: `Fechado hoje (${diasSemana[currentDayOfWeek]}) - Consulte nossos horários`,
        };
      }

      // Verificar se está aberto agora
      let isOpenNow = false;
      let currentSchedule = null;
      
      for (const schedule of todaySchedules) {
        const inicio = schedule.horario_inicio.slice(0, 5);
        const fim = schedule.horario_fim.slice(0, 5);
        
        if (currentTimeString >= inicio && currentTimeString <= fim) {
          isOpenNow = true;
          currentSchedule = schedule;
          break;
        }
      }

      if (isOpenNow && currentSchedule) {
        const closingTime = currentSchedule.horario_fim.slice(0, 5);
        return {
          isOpen: true,
          message: `✅ ABERTO agora! Funcionamos até às ${closingTime} hoje (${diasSemana[currentDayOfWeek]}).`,
        };
      }

      // Verificar se abre ainda hoje
      const futureSchedulesToday = todaySchedules.filter(schedule => {
        const inicio = schedule.horario_inicio.slice(0, 5);
        return currentTimeString < inicio;
      });

      if (futureSchedulesToday.length > 0) {
        const nextOpeningToday = futureSchedulesToday[0].horario_inicio.slice(0, 5);
        const closingToday = futureSchedulesToday[0].horario_fim.slice(0, 5);
        return {
          isOpen: false,
          message: `❌ FECHADO agora. Abriremos hoje (${diasSemana[currentDayOfWeek]}) às ${nextOpeningToday} e funcionaremos até às ${closingToday}.`,
          nextOpenTime: `hoje às ${nextOpeningToday}`,
        };
      }

      return {
        isOpen: false,
        message: `❌ FECHADO hoje (${diasSemana[currentDayOfWeek]}). Consulte nossos horários para os próximos dias.`,
      };
    }

    return {
      isOpen: false,
      message: 'Consulte nossos horários de funcionamento',
    };

  } catch (error) {
    console.error('❌ Erro ao calcular status:', error);
    return {
      isOpen: false,
      message: 'Erro ao verificar horários',
    };
  }
}

// Função para renderizar templates com variáveis
function renderTemplate(template: string, vars: Record<string, any>): string {
  if (!template || !vars) return template || '';
  
  let result = template;
  
  // Substituir variáveis simples {{variavel}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = vars[key];
    return value !== undefined ? String(value) : match;
  });
  
  return result;
}

// Função para processar prompt usando builder (compatibilidade com sistema atual)
function buildSystemPrompt(globalConfig: any, agentConfig: any, cardapioData?: string): string {
  let prompt = globalConfig.system_prompt || `Você é um assistente virtual especializado em atendimento ao cliente.`;
  
  // Variáveis para substituição
  const variables = {
    company_name: globalConfig.company_name || 'Estabelecimento',
    cardapio_url: `https://pedido.dominio.tech/${globalConfig.company_slug}`,
    agent_name: agentConfig.agent_name || 'Assistente Virtual',
    contact_phone: agentConfig.telefone || 'consulte nosso telefone',
    contact_address: agentConfig.endereco || 'consulte nosso endereço', 
    opening_hours: agentConfig.horario_funcionamento || 'consulte nossos horários',
    cashback_percent: agentConfig.cashback_percent || ''
  };
  
  // Substituir variáveis no template
  prompt = prompt.replace(/{company_name}/g, variables.company_name);
  prompt = prompt.replace(/{cardapio_url}/g, variables.cardapio_url);
  prompt = prompt.replace(/{agent_name}/g, variables.agent_name);
  prompt = prompt.replace(/{contact_phone}/g, variables.contact_phone);
  prompt = prompt.replace(/{contact_address}/g, variables.contact_address);
  prompt = prompt.replace(/{opening_hours}/g, variables.opening_hours);
  
  // Tratar cashback (só incluir se tiver valor)
  if (variables.cashback_percent && variables.cashback_percent !== '') {
    prompt = prompt.replace(/{cashback_percent}/g, variables.cashback_percent.toString());
  } else {
    prompt = prompt.replace(/{cashback_percent}%/g, '');
    prompt = prompt.replace(/{cashback_percent}/g, '');
  }
  
  // Adicionar dados do cardápio se disponível
  if (cardapioData && agentConfig.product_knowledge) {
    prompt += `\n\n📊 DADOS DO CARDÁPIO:
${cardapioData}

🍽️ INSTRUÇÕES CRÍTICAS PARA PRODUTOS:
- Use EXCLUSIVAMENTE as informações acima para responder sobre produtos
- JAMAIS invente preços, sabores, tamanhos ou informações não listadas
- Se não souber algo, seja HONESTO: "Não tenho essa informação no momento"
- Para informações ausentes, diga: "Posso chamar um atendente para essa informação"
- Sempre mencione preços exatos quando relevante
- Para produtos com opções, explique todas as escolhas disponíveis
- Calcule totais corretamente incluindo adicionais
- Se produto não estiver listado, diga CLARAMENTE: "Esse produto não está disponível no cardápio"
- Destaque ofertas especiais quando houver (baseado nos dados reais)
- NUNCA assuma ou invente características de produtos`;
  }

  return prompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('🚀 [AI-CHAT-DIRECT v5.0] INICIANDO PROCESSAMENTO - EMPRESA:', body?.company_slug);
    console.log('🔍 DEBUG - Body recebido:', JSON.stringify(body, null, 2));
    
    const { 
      company_id, 
      company_slug,
      user_message, 
      conversation_history = [],
      customer_phone,
      customer_name,
      chat_id 
    } = body;

    if (!company_id || !user_message) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'company_id e user_message são obrigatórios' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Configurar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🚫 VERIFICAÇÃO DE EMERGÊNCIA GLOBAL
    const { data: emergencyBlock } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'emergency_block_legacy_ai')
      .single();

    if (emergencyBlock?.value === 'true') {
      console.log('🚫 [AI-CHAT-DIRECT] Bloqueio de emergência ativo');
      return new Response(JSON.stringify({ 
        success: false,
        error: "Sistema em manutenção. Tente novamente em alguns minutos.",
        emergency_active: true
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se IA está pausada para este chat
    if (chat_id) {
      const { data: chatData } = await supabase
        .from('whatsapp_chats')
        .select('ai_paused')
        .eq('company_id', company_id)
        .eq('chat_id', chat_id)
        .maybeSingle();

      if (chatData?.ai_paused === true) {
        console.log('⏸️ IA pausada para este chat:', chat_id);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'IA pausada para este chat' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Buscar dados da empresa
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('slug, name')
      .eq('id', company_id)
      .single();

    if (companyError || !companyData) {
      console.error('❌ Empresa não encontrada:', companyError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Empresa não encontrada' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const slug = company_slug || companyData.slug;
    console.log(`🏢 Processando empresa: ${companyData.name} (${slug})`);

    // 🧠 BUSCAR HISTÓRICO DA CONVERSA
    let conversationHistory = conversation_history || [];
    
    if (customer_phone && company_id) {
      console.log('🔍 Buscando histórico da conversa para:', customer_phone);
      
      const { data: historyData, error: historyError } = await supabase
        .from('ai_conversation_logs')
        .select('message_content, message_type, created_at')
        .eq('company_id', company_id)
        .eq('customer_phone', customer_phone)
        .eq('message_type', 'chat_direct')
        .order('created_at', { ascending: true })
        .limit(20); // Últimas 20 mensagens
      
      if (historyError) {
        console.error('❌ Erro ao buscar histórico:', historyError);
      } else if (historyData && historyData.length > 0) {
        console.log('📚 Histórico encontrado:', historyData.length, 'mensagens');
        
        // Processar histórico para formato OpenAI
        conversationHistory = historyData.map(log => {
          const content = log.message_content;
          if (content.includes('USER:') && content.includes('AI:')) {
            const parts = content.split('\n');
            const userPart = parts.find(p => p.startsWith('USER:'));
            const aiPart = parts.find(p => p.startsWith('AI:'));
            
            return [
              { role: 'user', content: userPart?.replace('USER: ', '') || '' },
              { role: 'assistant', content: aiPart?.replace('AI: ', '') || '' }
            ];
          }
          return null;
        }).filter(Boolean).flat();
        
        console.log('🔄 Histórico processado:', conversationHistory.length, 'mensagens');
      } else {
        console.log('📭 Nenhum histórico encontrado para este cliente');
      }
    }

    // Buscar prompt da empresa específica
    const { data: promptData, error: promptError } = await supabase
      .from('ai_agent_prompts')
      .select('template, vars')
      .eq('agent_slug', slug)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (promptError) {
      console.error('❌ Erro ao buscar prompt:', promptError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao buscar prompt da empresa' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!promptData) {
      console.error('❌ Prompt não encontrado para empresa:', slug);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Prompt não configurado para esta empresa' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📝 Prompt encontrado:', promptData.template.length, 'caracteres');
    console.log('🔍 DEBUG - Template preview:', promptData.template.substring(0, 200));
    console.log('🔍 DEBUG - Vars recebidas:', JSON.stringify(promptData.vars, null, 2));

    // Processar template e substituir variáveis
    let finalInstructions = promptData.template;
    const vars = promptData.vars || {};
    
    // 🕐 CALCULAR STATUS DE FUNCIONAMENTO EM TEMPO REAL
    console.log('🕐 CALCULANDO horários dinâmicos para empresa:', company_id);
    const operatingStatus = await getOperatingStatus(supabase, company_id);
    console.log('✅ Status calculado:', operatingStatus);
    
    // 💳 BUSCAR CONFIGURAÇÕES DE PAGAMENTO E BANDEIRAS
    console.log('💳 Buscando configurações de pagamento para empresa:', company_id);
    const { data: paymentConfig, error: paymentError } = await supabase
      .from('payment_delivery_config')
      .select('id, accept_cash, accept_pix, accept_card, ask_card_brand')
      .eq('company_id', company_id)
      .single();

    let cardBrands = [];
    if (paymentConfig?.accept_card && paymentConfig?.id) {
      const { data: brandsData } = await supabase
        .from('payment_delivery_card_brands')
        .select('brand_name')
        .eq('config_id', paymentConfig.id);
      
      cardBrands = brandsData?.map(b => b.brand_name) || [];
    }

    // Construir texto de formas de pagamento
    let paymentMethodsText = 'Formas de pagamento aceitas:\n';
    if (paymentConfig?.accept_cash) paymentMethodsText += '• 💰 Dinheiro\n';
    if (paymentConfig?.accept_pix) paymentMethodsText += '• 🏷️ PIX\n';
    if (paymentConfig?.accept_card && cardBrands.length > 0) {
      paymentMethodsText += `• 💳 Cartão (bandeiras aceitas: ${cardBrands.join(', ')})\n`;
    } else if (paymentConfig?.accept_card) {
      paymentMethodsText += '• 💳 Cartão\n';
    }

    console.log('💳 Configurações de pagamento encontradas:', { 
      accept_cash: paymentConfig?.accept_cash,
      accept_pix: paymentConfig?.accept_pix, 
      accept_card: paymentConfig?.accept_card,
      cardBrands: cardBrands
    });
    
    // Injetar status real nos vars
    vars.working_hours = operatingStatus.message;
    vars.current_status = operatingStatus.isOpen ? 'ABERTO' : 'FECHADO';
    vars.status_message = operatingStatus.message;
    vars.payment_methods = paymentMethodsText;
    
    // FORÇAR USO DO TEMPLATE PERSONALIZADO COM HORÁRIOS DINÂMICOS
    console.log('✨ FORÇANDO uso do template PERSONALIZADO com HORÁRIOS DINÂMICOS');
    finalInstructions = renderTemplate(promptData.template, vars);
    
    // Se o template contém informações de horário estático, substituir por dinâmico
    if (finalInstructions.includes('working_hours') || finalInstructions.includes('horário')) {
      // Adicionar informação dinâmica de status no início do prompt
      finalInstructions = `## STATUS ATUAL DA LOJA (TEMPO REAL)
${operatingStatus.message}

## INSTRUÇÕES IMPORTANTES SOBRE HORÁRIOS:
- Use APENAS as informações de horário calculadas em tempo real acima
- NUNCA responda "estamos abertos" se o status atual indicar FECHADO
- NUNCA responda "estamos fechados" se o status atual indicar ABERTO
- Para perguntas sobre horários, use exatamente a informação do status atual

${finalInstructions}`;
    }
    
    console.log('🔍 DEBUG - Vars aplicadas:', Object.keys(vars));
    console.log('🔍 DEBUG - Status injetado:', operatingStatus.message);
    console.log('🔍 DEBUG - Template final preview:', finalInstructions.substring(0, 400));

    // Buscar configuração global da IA
    const { data: globalConfig } = await supabase
      .from('ai_global_config')
      .select('openai_model, max_tokens, temperature')
      .eq('is_active', true)
      .single();

    if (!globalConfig) {
      console.error('❌ Configuração global da IA não encontrada');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Configuração global da IA não encontrada' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Obter chave da OpenAI do Supabase Secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('❌ Chave da OpenAI não configurada nos secrets');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Chave da OpenAI não configurada' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Preparar mensagens para OpenAI
    const messages = [
      { role: 'system', content: finalInstructions },
      ...conversationHistory.slice(-10), // Últimas 10 mensagens
      { role: 'user', content: user_message }
    ];

    console.log('📤 Enviando para OpenAI:', {
      model: globalConfig.openai_model,
      messagesCount: messages.length,
      instructionsLength: finalInstructions.length
    });

    // Chamar OpenAI Chat Completions API
    const startTime = Date.now();
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: globalConfig.openai_model || 'gpt-4o-mini',
        messages,
        max_tokens: globalConfig.max_tokens || 1000,
        temperature: globalConfig.temperature || 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ Erro OpenAI:', errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Erro OpenAI: ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = await openaiResponse.json();
    const responseTime = Date.now() - startTime;
    const aiResponse = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    console.log('✅ Resposta gerada:', {
      responseTime: `${responseTime}ms`,
      tokensUsed,
      responseLength: aiResponse.length,
      aiResponsePreview: aiResponse.substring(0, 200)
    });

    // Salvar log da conversa
    await supabase
      .from('ai_conversation_logs')
      .insert({
        company_id,
        customer_phone,
        customer_name,
        message_content: `USER: ${user_message}\nAI: ${aiResponse}`,
        message_type: 'chat_direct',
        tokens_used: tokensUsed,
        response_time_ms: responseTime,
        created_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({ 
      success: true,
      response: aiResponse,
      tokens_used: tokensUsed,
      response_time_ms: responseTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro na função AI Chat Direct:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});