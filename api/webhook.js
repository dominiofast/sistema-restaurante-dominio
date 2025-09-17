import { createClient } from '@supabase/supabase-js';

// Configurações
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');

  try {
    console.log('=== WEBHOOK INICIADO ===');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Variáveis de ambiente não configuradas');
      return res.status(500).json({ error: 'Configuração ausente' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const data = req.body;
    
    // Extrair dados da mensagem
    const messageData = extractMessageData(data);
    if (!messageData.valid) {
      return res.status(400).json({ error: messageData.error });
    }

    // Buscar integração
    const integration = await findIntegration(supabase, messageData.instanceKey);
    if (!integration) {
      return res.status(404).json({ error: 'Integração não encontrada' });
    }

    console.log(`Processando mensagem de ${messageData.contactName}: ${messageData.message}`);

    // Verificar se é primeira mensagem
    const isFirstMessage = await checkFirstMessage(supabase, integration.company_id, messageData.from, messageData.isFromMe);

    // Salvar mensagem no banco
    if (messageData.from && messageData.message) {
      await saveMessage(supabase, integration.company_id, messageData, isFirstMessage);
    }

    // Se for mensagem própria, não responder
    if (messageData.isFromMe) {
      return res.status(200).json({ status: 'ok' });
    }

    // VERIFICAÇÃO CRÍTICA DE PAUSA: Verificar se IA está pausada para este chat
    const chatId = messageData.from;
    console.log(`🔍 VERIFICAÇÃO DE PAUSA - Chat: ${chatId} | Company: ${integration.company_id}`);
    
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('whatsapp_chats')
        .select('ai_paused, chat_id, company_id')
        .eq('company_id', integration.company_id)
        .eq('chat_id', chatId)
        .single();
      
      console.log('📊 Resultado da busca do chat:', { chatData, chatError });
      
      // Se não encontrou o chat, criar um novo (IA ativa por padrão)
      if (chatError && chatError.code === 'PGRST116') {
        console.log(`✨ Chat não existe, criando novo chat para: ${chatId} na empresa: ${integration.company_id}`);
        await supabase
          .from('whatsapp_chats')
          .insert({
            chat_id: chatId,
            company_id: integration.company_id,
            contact_phone: messageData.from,
            contact_name: messageData.contactName || 'Contato',
            ai_paused: false,
            last_message: messageData.message,
            last_message_time: new Date().toISOString()
          });
        console.log(`✅ Chat criado com IA ATIVA por padrão`);
      }
      
      // DECISÃO FINAL DE PAUSA
      const isAIPaused = chatData?.ai_paused === true;
      console.log(`🎯 DECISÃO FINAL - IA Pausada: ${isAIPaused}`);
      
      if (isAIPaused) {
        console.log(`🚫 IA PAUSADA CONFIRMADA - Chat: ${chatId} | Company: ${integration.company_id}`);
        
        // Log da pausa
        try {
          await supabase.from('ai_conversation_logs').insert({
            company_id: integration.company_id,
            customer_phone: messageData.from?.replace('@s.whatsapp.net', '') || '',
            customer_name: messageData.contactName,
            message_content: `🚫 IA PAUSADA - NÃO PROCESSADO: "${messageData.message}" | Chat: ${chatId}`,
            message_type: 'ai_paused_confirmed'
          });
        } catch (logError) {
          console.error('❌ Erro ao registrar pausa:', logError);
        }
        
        // ✅ PARAR AQUI - NÃO PROCESSAR MENSAGEM
        return res.status(200).json({ 
          status: 'paused', 
          message: 'IA pausada para este chat específico - NÃO PROCESSADO',
          chat_id: chatId,
          company_id: integration.company_id,
          ai_paused: true
        });
      }
      
      console.log(`✅ IA ATIVA - Processando mensagem | Chat: ${chatId} | Company: ${integration.company_id}`);
      
      // Log de processamento
      try {
        await supabase.from('ai_conversation_logs').insert({
          company_id: integration.company_id,
          customer_phone: messageData.from?.replace('@s.whatsapp.net', '') || '',
          customer_name: messageData.contactName,
          message_content: `✅ IA ATIVA - PROCESSANDO: "${messageData.message}" | Chat: ${chatId}`,
          message_type: 'ai_active_processing'
        });
      } catch (logError) {
        console.error('❌ Erro ao registrar processamento:', logError);
      }
      
    } catch (pauseError) {
      console.error('❌ Erro na verificação de pausa:', pauseError);
      // Em caso de erro, continuar processamento (failsafe)
    }

    // Gerar e enviar resposta
    if (messageData.from && integration.token && messageData.message) {
      console.log('🤖 Iniciando geração de resposta...');
      console.log('Dados disponíveis:', {
        from: messageData.from,
        token: integration.token ? 'PRESENTE' : 'AUSENTE',
        message: messageData.message,
        instanceKey: messageData.instanceKey
      });
      
      try {
        const response = await generateResponse(supabase, integration, messageData, isFirstMessage);
        console.log('📝 Resposta gerada:', response ? response.substring(0, 100) : 'NULA');
        
        if (response) {
          console.log('📤 Enviando resposta via WhatsApp...');
          await sendResponse(messageData.instanceKey, integration.token, messageData.from, response);
          console.log('✅ Resposta enviada com sucesso');
          
          console.log('💾 Salvando mensagem do bot...');
          await saveBotMessage(supabase, integration.company_id, messageData, response);
          console.log('✅ Mensagem do bot salva');
        } else {
          console.log('❌ Resposta nula - não enviando');
        }
      } catch (responseError) {
        console.error('❌ Erro ao processar resposta:', responseError);
      }
    } else {
      console.log('❌ Dados insuficientes para gerar resposta:', {
        from: messageData.from,
        token: integration.token ? 'PRESENTE' : 'AUSENTE', 
        message: messageData.message
      });
    }

    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Extrair dados da mensagem
function extractMessageData(data) {
  const instanceKey = data.instance_key || data.instanceKey || data?.messageData?.instance_key;
  if (!instanceKey) {
    return { valid: false, error: 'instance_key não encontrado' };
  }

  const from = data.key?.remoteJid || data.jid || data.messageData?.from || data.from;
  const message = data.message?.conversation || data.message?.extendedTextMessage?.text || data.message?.text || '';
  const contactName = data.pushName || data.notifyName || from?.split('@')[0] || 'Desconhecido';
  const isFromMe = data.key?.fromMe || false;
  const messageId = data.key?.id || data.messageId || `${Date.now()}_${Math.random()}`;
  const timestamp = data.messageTimestamp ? new Date(data.messageTimestamp * 1000) : new Date();

  return {
    valid: true,
    instanceKey,
    from,
    message,
    contactName,
    isFromMe,
    messageId,
    timestamp
  };
}

// Buscar integração pelo instance_key (corrigido para retornar objeto único)
async function findIntegration(supabase, instanceKey) {
  const { data: integration, error } = await supabase
    .from('whatsapp_integrations')
    .select('token, ia_agent_preset, ia_model, ia_temperature, company_id')
    .eq('instance_key', instanceKey)
    .single(); // CRÍTICO: usar single() para retornar objeto único

  if (error || !integration) {
    console.error('Erro ao buscar integração:', error);
    return null;
  }

  console.log(`🏢 Integração encontrada para instance_key: ${instanceKey} | Company: ${integration.company_id}`);
  return integration; // Retorna objeto único
}

// Verificar se é primeira mensagem
async function checkFirstMessage(supabase, companyId, from, isFromMe) {
  if (!from || isFromMe) return false;

  const { data: existingMessages } = await supabase
    .from('whatsapp_messages')
    .select('id')
    .eq('company_id', companyId)
    .eq('chat_id', from)
    .eq('is_from_me', false)
    .limit(1);

  return !existingMessages || existingMessages.length === 0;
}

// Salvar mensagem no banco
async function saveMessage(supabase, companyId, messageData, isFirstMessage) {
  try {
    // Salvar mensagem
    const { error: messageError } = await supabase
      .from('whatsapp_messages')
      .insert({
        company_id: companyId,
        chat_id: messageData.from,
        contact_name: messageData.contactName,
        contact_phone: messageData.from,
        message_id: messageData.messageId,
        message_content: messageData.message,
        message_type: 'text',
        is_from_me: messageData.isFromMe,
        status: messageData.isFromMe ? 'sent' : 'received',
        timestamp: messageData.timestamp.toISOString()
      });

    if (messageError) {
      console.error('Erro ao salvar mensagem:', messageError);
    }

    // Broadcast imediato para o frontend (entrega ativa)
    try {
      await fetch(`${SUPABASE_URL}/realtime/v1/broadcast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': `${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          topic: `whatsapp:${companyId}`,
          event: 'new_message',
          payload: {
            company_id: companyId,
            chat_id: messageData.from,
            contact_name: messageData.contactName,
            contact_phone: messageData.from,
            message_id: messageData.messageId,
            message_content: messageData.message,
            message_type: 'text',
            is_from_me: messageData.isFromMe,
            status: messageData.isFromMe ? 'sent' : 'received',
            timestamp: messageData.timestamp.toISOString()
          }
        })
      });
      console.log('📡 Broadcast (new_message) enviado');
    } catch (e) {
      console.warn('⚠️ Falha ao publicar broadcast:', e?.message || e);
    }

    // Salvar ou atualizar chat
    await saveOrUpdateChat(supabase, companyId, messageData);

  } catch (err) {
    console.error('Erro ao processar mensagem:', err);
  }
}

// Salvar ou atualizar chat
async function saveOrUpdateChat(supabase, companyId, messageData) {
  const { data: existingChat } = await supabase
    .from('whatsapp_chats')
    .select('id, unread_count')
    .eq('company_id', companyId)
    .eq('chat_id', messageData.from)
    .single();

  if (existingChat) {
    await supabase
      .from('whatsapp_chats')
      .update({
        contact_name: messageData.contactName,
        last_message: messageData.message,
        last_message_time: messageData.timestamp.toISOString(),
        unread_count: messageData.isFromMe ? 0 : (existingChat.unread_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingChat.id);
  } else {
    await supabase
      .from('whatsapp_chats')
      .insert({
        company_id: companyId,
        chat_id: messageData.from,
        contact_name: messageData.contactName,
        contact_phone: messageData.from,
        last_message: messageData.message,
        last_message_time: messageData.timestamp.toISOString(),
        unread_count: messageData.isFromMe ? 0 : 1
      });
  }
}

// Gerar resposta usando IA
async function generateResponse(supabase, integration, messageData, isFirstMessage) {
  try {
    console.log('Gerando resposta para:', messageData.message);

    // Se for primeira mensagem, tentar gerar boas-vindas personalizadas
    if (isFirstMessage) {
      const welcomeMessage = await generateWelcomeMessage(supabase, integration.company_id, messageData.contactName, messageData.from);
      if (welcomeMessage) {
        console.log('Boas-vindas personalizadas geradas');
        return welcomeMessage;
      }
    }

    // Gerar resposta com IA
    console.log('Tentando gerar resposta IA...');
    const aiResponse = await generateAIResponse(supabase, integration, messageData);
    console.log('Resposta IA recebida:', aiResponse ? 'Sucesso' : 'Falhou');
    if (aiResponse) {
      console.log('Resposta IA gerada:', aiResponse.substring(0, 100));
      return aiResponse;
    }

    // Fallback: tentar chamada direta para agente-ia-conversa
    console.log('Tentando fallback direto para agente-ia-conversa...');
    try {
      const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('agente-ia-conversa', {
        body: {
          slug_empresa: company?.slug, // usar slug da empresa como fallback
          user_message: messageData.message,
          historico: [],
          customer_phone: messageData.from?.replace('@s.whatsapp.net', '') || '5511999999999',
          customer_name: messageData.contactName || 'Cliente'
        }
      });
      
      if (fallbackData?.resposta) {
        console.log('Fallback funcionou:', fallbackData.resposta.substring(0, 100));
        return fallbackData.resposta;
      }
    } catch (fallbackErr) {
      console.error('Erro no fallback:', fallbackErr);
    }
    
    // Fallback final - ELIMINAR MENSAGEM PADRÃO
    if (integration.company_id === '550e8400-e29b-41d4-a716-446655440001') {
      return 'Olá! Sou o Assistente Domínio Pizzas! 🍕 Como posso te ajudar hoje?';
    }
    return 'Olá! Como posso te ajudar?';

  } catch (err) {
    console.error('Erro ao gerar resposta:', err);
    // Fallback final - ELIMINAR MENSAGEM PADRÃO
    if (integration.company_id === '550e8400-e29b-41d4-a716-446655440001') {
      return 'Olá! Sou o Assistente Domínio Pizzas! 🍕 Como posso te ajudar hoje?';
    }
    return 'Olá! Como posso te ajudar?';
  }
}

// Gerar mensagem de boas-vindas personalizada
async function generateWelcomeMessage(supabase, companyId, contactName, phone) {
  try {
    console.log('=== GERANDO BOAS-VINDAS ===');
    console.log('Company ID:', companyId);
    console.log('Contact Name:', contactName);
    
    // Buscar dados da empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name, slug')
      .eq('id', companyId)
      .single();

    console.log('Empresa encontrada:', company, 'Erro:', companyError);

    if (!company) {
      console.log('Empresa não encontrada, usando fallback básico');
      return `Olá, ${contactName}! 👋\n\nRecebemos sua mensagem e entraremos em contato em breve.`;
    }

    // Buscar configuração do agente IA
    const { data: agentConfig, error: agentError } = await supabase
      .from('ai_agent_config')
      .select('is_active, agent_name, welcome_message, sales_phrases')
      .eq('company_id', companyId)
      .single();

    console.log('Agente IA encontrado:', agentConfig, 'Erro:', agentError);

    // URL do cardápio
    const cardapioUrl = `https://pedido.dominio.tech/${company.slug}`;
    console.log('URL do cardápio:', cardapioUrl);

    // Criar mensagem de boas-vindas conforme especificação
    const agentName = agentConfig?.agent_name || 'Atendente Virtual';
    
    const fallbackMessage = `Oi, ${contactName}! Tudo bem? Este é o nosso autoatendimento! 🤖\n\n${cardapioUrl}`;
    console.log('Mensagem fallback criada:', fallbackMessage);

    // Se agente IA ativo, tentar gerar mensagem personalizada
    if (agentConfig?.is_active) {
      console.log('Agente IA ativo, tentando gerar mensagem personalizada...');
      
      try {
        const welcomeResponse = await fetch(`${SUPABASE_URL}/functions/v1/agente-ia-conversa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            slug_empresa: company.slug,
            user_message: 'Olá',
            historico: [],
            customer_name: contactName,
            customer_phone: (phone || '').replace('@s.whatsapp.net','')
          })
        });

        console.log('Status da resposta da edge function:', welcomeResponse.status);

        if (welcomeResponse.ok) {
          const welcomeData = await welcomeResponse.json();
          console.log('Dados da edge function:', welcomeData);
          
          if (welcomeData.resposta) {
            console.log('Usando resposta personalizada da edge function');
            return welcomeData.resposta;
          }
        } else {
          console.log('Edge function falhou, usando fallback');
        }
      } catch (edgeFunctionError) {
        console.error('Erro na edge function:', edgeFunctionError);
      }
    }

    // SEMPRE retornar o fallback garantido
    console.log('Retornando mensagem fallback garantida');
    return fallbackMessage;

  } catch (err) {
    console.error('Erro geral na função de boas-vindas:', err);
    // Fallback final limpo conforme especificação
    return `Oi, ${contactName}! Tudo bem? Este é o nosso autoatendimento! 🤖\n\nhttps://pedido.dominio.tech`;
  }
}

// Gerar resposta com IA - FORÇANDO PROMPT PERSONALIZADO
async function generateAIResponse(supabase, integration, messageData) {
  try {
    console.log('=== GENERATE AI RESPONSE - FORÇANDO PROMPT PERSONALIZADO ===');
    console.log('Integration company_id:', integration.company_id);
    console.log('Message:', messageData.message);
    
    // Buscar empresa para obter o slug
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('slug')
      .eq('id', integration.company_id)
      .single();
    
    console.log('Company found:', company);
    if (companyError) console.log('Company error:', companyError);

    // Montar histórico a partir das últimas mensagens do chat
    const { data: msgs } = await supabase
      .from('whatsapp_messages')
      .select('message_content, is_from_me')
      .eq('company_id', integration.company_id)
      .eq('chat_id', messageData.from)
      .order('timestamp', { ascending: true })
      .limit(10);

    const historico = (msgs || []).map(m => ({
      role: m.is_from_me ? 'assistant' : 'user',
      content: m.message_content
    }));

    const phone = (messageData.from || '').replace('@s.whatsapp.net','');

    // USAR ai-chat-direct PARA TODAS AS EMPRESAS
    const companySlug = company?.slug;
    console.log('Chamando ai-chat-direct para empresa:', companySlug);
    
    // USAR O SLUG CORRETO DE CADA EMPRESA
    const { data, error } = await supabase.functions.invoke('ai-chat-direct', {
      body: {
        company_id: integration.company_id,
        company_slug: company?.slug, // USAR SLUG CORRETO DE CADA EMPRESA
        user_message: messageData.message,
        conversation_history: historico,
        customer_phone: phone,
        customer_name: messageData.contactName
      }
    });

    console.log('ai-chat-direct response:', { data, error });

    if (error) {
      console.error('Erro ao invocar ai-chat-direct:', error);
      // Se falhar, tentar agente-ia-conversa como fallback
      console.log('Tentando agente-ia-conversa como fallback...');
      const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('agente-ia-conversa', {
        body: {
          slug_empresa: companySlug,
          user_message: messageData.message,
          historico,
          customer_phone: phone,
          customer_name: messageData.contactName
        }
      });
      
      if (fallbackData?.resposta) {
        console.log('Fallback agente-ia-conversa funcionou');
        return fallbackData.resposta;
      }
      return null;
    }

    const resposta = data?.response || data?.resposta || null;
    console.log('Resposta final do ai-chat-direct:', resposta ? resposta.substring(0, 100) : 'null');
    return resposta;
  } catch (err) {
    console.error('Erro ao gerar resposta IA:', err);
    
    // ÚLTIMO FALLBACK: agente-ia-conversa
    try {
      console.log('ÚLTIMO FALLBACK: agente-ia-conversa...');
      const { data: directData, error: directError } = await supabase.functions.invoke('agente-ia-conversa', {
        body: {
          slug_empresa: company?.slug,
          user_message: messageData.message,
          historico: [],
          customer_phone: phone,
          customer_name: messageData.contactName
        }
      });
      
      if (directData?.resposta) {
        console.log('Último fallback funcionou');
        return directData.resposta;
      }
    } catch (directErr) {
      console.error('Erro no último fallback:', directErr);
    }
    
    return null;
  }
}

// Construir contexto da empresa para o prompt
function buildCompanyContext(company, companyInfo, agentConfig, horarios) {
  let context = '';

  if (company) {
    context += `Nome: ${company.name}\n`;
    // Link do cardápio será mencionado apenas quando necessário no prompt
  }

  if (companyInfo) {
    if (companyInfo.telefone) context += `Telefone: ${companyInfo.telefone}\n`;
    if (companyInfo.endereco) context += `Endereço: ${companyInfo.endereco}`;
    if (companyInfo.numero) context += `, ${companyInfo.numero}`;
    if (companyInfo.bairro) context += `, ${companyInfo.bairro}`;
    if (companyInfo.cidade) context += `, ${companyInfo.cidade}`;
    if (companyInfo.estado) context += ` - ${companyInfo.estado}`;
    if (companyInfo.cep) context += `, CEP: ${companyInfo.cep}`;
    context += '\n';
    
    if (companyInfo.instagram) context += `Instagram: ${companyInfo.instagram}\n`;
    if (companyInfo.segmento) context += `Segmento: ${companyInfo.segmento}\n`;
  }

  if (horarios && horarios.horarios_dias) {
    context += '\nHorários de Funcionamento:\n';
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    // Usar o fuso horário da empresa, não do servidor
    const fusoHorario = horarios.fuso_horario || 'America/Sao_Paulo';
    const agora = new Date();
    const dataLocal = new Date(agora.toLocaleString('en-US', { timeZone: fusoHorario }));
    const hoje = dataLocal.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const horaAtual = dataLocal.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Informações do dia atual e cálculo de status
    const horarioHoje = horarios.horarios_dias.find(dia => dia.dia_semana === hoje);
    let statusAtual = 'FECHADO';
    
    if (horarioHoje && horarioHoje.ativo) {
      const horaInicioNum = parseInt(horarioHoje.horario_inicio.replace(':', ''));
      const horaFimNum = parseInt(horarioHoje.horario_fim.replace(':', ''));
      const horaAtualNum = parseInt(horaAtual.replace(':', ''));
      
      if (horaAtualNum >= horaInicioNum && horaAtualNum <= horaFimNum) {
        statusAtual = 'ABERTO AGORA';
      } else {
        statusAtual = 'FECHADO NO MOMENTO';
      }
      
      context += `HOJE (${diasSemana[hoje]}): ${horarioHoje.horario_inicio} às ${horarioHoje.horario_fim}\n`;
    } else {
      context += `HOJE (${diasSemana[hoje]}): FECHADO\n`;
    }
    
    context += `Horário atual: ${horaAtual}\n`;
    context += `STATUS ATUAL: ${statusAtual}\n\n`;
    context += `IMPORTANTE: Use o status atual nas suas respostas. Se estiver fechado, informe quando abrirá novamente.\n`;
    
    context += '\nTodos os horários:\n';
    horarios.horarios_dias.forEach(dia => {
      if (dia.ativo) {
        context += `${diasSemana[dia.dia_semana]}: ${dia.horario_inicio} às ${dia.horario_fim}\n`;
      } else {
        context += `${diasSemana[dia.dia_semana]}: Fechado\n`;
      }
    });
  }

  if (agentConfig) {
    if (agentConfig.sales_phrases) context += `\nFrases de Venda: ${agentConfig.sales_phrases}\n`;
  }

  return context || 'Informações da empresa não disponíveis.';
}

// Enviar resposta via MegaAPI
async function sendResponse(instanceKey, token, to, message) {
  function defangLinks(text) {
    // Função desabilitada - não modificar links para manter preview limpo
    return text;
  }
  try {
    const safe = defangLinks(message);
    const response = await fetch(`https://apinocode01.megaapi.com.br/rest/sendMessage/${instanceKey}/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageData: { to, text: safe, linkPreview: false, preview_url: false }
      })
    });

    const responseData = await response.json().catch(() => ({}));
    console.log('Resposta enviada:', response.status, responseData.error ? 'Erro' : 'Sucesso');

    return response.ok;

  } catch (err) {
    console.error('Erro ao enviar resposta:', err);
    return false;
  }
}

// Salvar mensagem do bot no banco
async function saveBotMessage(supabase, companyId, messageData, response) {
  try {
    const botMessageId = `bot_${Date.now()}_${Math.random()}`;
    const botTimestamp = new Date();

    await supabase
      .from('whatsapp_messages')
      .insert({
        company_id: companyId,
        chat_id: messageData.from,
        contact_name: messageData.contactName,
        contact_phone: messageData.from,
        message_id: botMessageId,
        message_content: response,
        message_type: 'text',
        is_from_me: true,
        status: 'sent',
        timestamp: botTimestamp.toISOString()
      });

    // Broadcast da resposta do bot
    try {
      await fetch(`${SUPABASE_URL}/realtime/v1/broadcast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': `${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          topic: `whatsapp:${companyId}`,
          event: 'new_message',
          payload: {
            company_id: companyId,
            chat_id: messageData.from,
            contact_name: messageData.contactName,
            contact_phone: messageData.from,
            message_id: botMessageId,
            message_content: response,
            message_type: 'text',
            is_from_me: true,
            status: 'sent',
            timestamp: botTimestamp.toISOString()
          }
        })
      });
      console.log('📡 Broadcast (bot message) enviado');
    } catch (e) {
      console.warn('⚠️ Falha ao publicar broadcast (bot):', e?.message || e);
    }

    // Atualizar chat com a resposta do bot
    await supabase
      .from('whatsapp_chats')
      .update({
        last_message: response,
        last_message_time: botTimestamp.toISOString(),
        unread_count: 0,
        updated_at: botTimestamp.toISOString()
      })
      .eq('company_id', companyId)
      .eq('chat_id', messageData.from);

  } catch (err) {
    console.error('Erro ao salvar resposta do bot:', err);
  }
}