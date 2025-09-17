
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

function defangLinks(text) {
  // Função desabilitada - não modificar links para manter preview limpo
  return text;
}

exports.handler = async (event, context) => {
  // Log detalhado do evento recebido e variáveis de ambiente
  console.log('--- INÍCIO WEBHOOK ---');
  console.log('Headers:', JSON.stringify(event.headers));
  console.log('Body recebido:', event.body);
  console.log('Variáveis de ambiente:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data = {};
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    console.error('JSON inválido:', e);
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Log do payload para depuração
  console.log('Payload recebido:', data);

  // Tentar extrair instance_key do evento recebido
  const instanceKey = data.instance_key || data.instanceKey || data?.messageData?.instance_key || data?.messageData?.instanceKey;
  console.log('Instance Key extraído:', instanceKey);
  if (!instanceKey) {
    console.warn('instance_key não encontrado no payload:', data);
    return { statusCode: 400, body: 'instance_key não encontrado no payload' };
  }

  // Conectar ao Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados');
    return { statusCode: 500, body: 'Supabase config missing' };
  }
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Buscar integração pelo instance_key (incluindo config IA)
  const { data: integration, error } = await supabase
    .from('whatsapp_integrations')
    .select('token, ia_agent_preset, ia_model, ia_temperature, company_id')
    .eq('instance_key', instanceKey)
    .single();

  if (error || !integration) {
    console.error('Erro ao buscar integração no Supabase:', error);
    return { statusCode: 404, body: 'Integração não encontrada' };
  }

  console.log('Integração encontrada:', integration);

  // Evita loop: só responde se a mensagem NÃO foi enviada pelo próprio bot
  const isFromMe = data.key?.fromMe || false;
  if (isFromMe) {
    console.log('Mensagem enviada por mim mesmo (bot), salvando mas não respondendo para evitar loop.');
  }

  // Extrair destinatário correto (cliente) priorizando key.remoteJid para evitar loop
  const from = data.key?.remoteJid || data.jid || data.messageData?.from || data.from || data.remoteJid || null;
  console.log('Remetente extraído (from):', from);
  
  // Extrair mensagem recebida do cliente
  const mensagemCliente =
    data.message?.conversation ||
    data.message?.extendedTextMessage?.text ||
    data.message?.text ||
    '';
  
  console.log('Mensagem do cliente:', mensagemCliente);

  // Extrair nome do contato (se disponível)
  const contactName = data.pushName || data.notifyName || from?.split('@')[0] || 'Desconhecido';

  // Verificar se é primeira mensagem do cliente (ANTES de salvar qualquer coisa)
  let isFirstMessage = false;
  if (from && mensagemCliente && !isFromMe) {
    const { data: existingMessages } = await supabase
      .from('whatsapp_messages')
      .select('id')
      .eq('company_id', integration.company_id)
      .eq('chat_id', from)
      .eq('is_from_me', false)
      .limit(1);

    isFirstMessage = !existingMessages || existingMessages.length === 0;
    console.log('Verificação primeira mensagem:', { isFirstMessage, existingMessagesCount: existingMessages?.length || 0, contactName });
  }

  // Salvar mensagem no banco de dados
  if (from && mensagemCliente) {
    try {
      const messageId = data.key?.id || data.messageId || `${Date.now()}_${Math.random()}`;
      const timestamp = data.messageTimestamp ? new Date(data.messageTimestamp * 1000) : new Date();
      
      // Log dos dados antes de salvar
      console.log('Salvando mensagem com dados:', {
        company_id: integration.company_id,
        chat_id: from,
        contact_name: contactName,
        message_content: mensagemCliente,
        is_from_me: isFromMe,
        message_id: messageId,
        timestamp: timestamp
      });
      
      // Salvar mensagem
      const { data: savedMessage, error: messageError } = await supabase
        .from('whatsapp_messages')
        .insert({
          company_id: integration.company_id,
          chat_id: from,
          contact_name: contactName,
          contact_phone: from,
          message_id: messageId,
          message_content: mensagemCliente,
          message_type: 'text',
          is_from_me: isFromMe,
          status: isFromMe ? 'sent' : 'received',
          timestamp: timestamp.toISOString()
        })
        .select();
      
      if (messageError) {
        console.error('Erro ao salvar mensagem:', messageError);
        console.error('Detalhes do erro:', messageError.message, messageError.details);
      } else {
        console.log('Mensagem salva com sucesso:', savedMessage);
      }

      // Salvar ou atualizar chat
      const { data: existingChat } = await supabase
        .from('whatsapp_chats')
        .select('id, unread_count')
        .eq('company_id', integration.company_id)
        .eq('chat_id', from)
        .single();

      if (existingChat) {
        // Atualizar chat existente
        const { error: updateChatError } = await supabase
          .from('whatsapp_chats')
          .update({
            contact_name: contactName,
            last_message: mensagemCliente,
            last_message_time: timestamp.toISOString(),
            unread_count: isFromMe ? 0 : (existingChat.unread_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingChat.id);

        if (updateChatError) {
          console.error('Erro ao atualizar chat:', updateChatError);
        } else {
          console.log('Chat atualizado com sucesso');
        }
      } else {
        // Criar novo chat
        const { data: newChat, error: createChatError } = await supabase
          .from('whatsapp_chats')
          .insert({
            company_id: integration.company_id,
            chat_id: from,
            contact_name: contactName,
            contact_phone: from,
            last_message: mensagemCliente,
            last_message_time: timestamp.toISOString(),
            unread_count: isFromMe ? 0 : 1
          })
          .select();

        if (createChatError) {
          console.error('Erro ao criar chat:', createChatError);
        } else {
          console.log('Chat criado com sucesso:', newChat);
        }
      }
      
    } catch (err) {
      console.error('Erro ao processar mensagem:', err);
    }
  }
  
  // Se for mensagem própria, não responder
  if (isFromMe) {
    return { statusCode: 200, body: 'ok' };
  }

  // VERIFICAÇÃO CRÍTICA DE PAUSA - Verificar se IA está pausada para este chat
  if (from && mensagemCliente && !isFromMe) {
    console.log('🔍 VERIFICANDO SE IA ESTÁ PAUSADA para:', from);
    
    const { data: chatData } = await supabase
      .from('whatsapp_chats')
      .select('ai_paused')
      .eq('company_id', integration.company_id)
      .eq('chat_id', from)
      .single();
    
    const isAIPaused = chatData?.ai_paused === true;
    console.log(`🎯 NETLIFY WEBHOOK - IA Pausada: ${isAIPaused} para chat: ${from}`);
    
    if (isAIPaused) {
      console.log(`🚫 IA PAUSADA CONFIRMADA (NETLIFY) - Chat: ${from} | Company: ${integration.company_id}`);
      
      // Log detalhado da pausa
      await supabase.from('ai_conversation_logs').insert({
        company_id: integration.company_id,
        customer_phone: from.replace('@s.whatsapp.net', ''),
        customer_name: contactName,
        message_content: `🚫 IA PAUSADA (NETLIFY) - NÃO PROCESSADO: "${mensagemCliente}" | Chat: ${from}`,
        message_type: 'ai_paused_netlify'
      });
      
      // Retornar sem enviar resposta
      return { 
        statusCode: 200, 
        body: JSON.stringify({ 
          status: 'paused', 
          message: 'IA pausada para este chat (Netlify webhook)',
          chat_id: from,
          company_id: integration.company_id
        }) 
      };
    }
  }

  // Montar resposta automática
  let resposta = 'Olá! Sou o Assistente Domínio Pizzas! 🍕\n\nComo posso te ajudar hoje?\n\n🍽️ Confira nosso cardápio: https://pedido.dominio.tech/dominiopizzas';

  if (mensagemCliente) {
    try {
      // Se for primeira mensagem, gerar boas-vindas usando o prompt configurado
      if (isFirstMessage) {
        console.log('Primeira mensagem detectada, gerando boas-vindas personalizadas...');
        
        // Buscar dados da empresa e prompt configurado
        const { data: company } = await supabase
          .from('companies')
          .select('name, slug')
          .eq('id', integration.company_id)
          .single();
        
        if (company) {
          // Buscar prompt configurado para esta empresa
          const { data: promptData } = await supabase
            .from('ai_agent_prompts')
            .select('template, vars')
            .eq('agent_slug', company.slug)
            .single();

          // Buscar configuração de cashback
          const { data: cashbackConfig } = await supabase
            .from('cashback_config')
            .select('percentual_cashback')
            .eq('company_id', integration.company_id)
            .eq('is_active', true)
            .single();

          const cardapioUrl = `https://pedido.dominio.tech/${company.slug}`;
          const cashbackPercent = cashbackConfig?.percentual_cashback || 0;
          
          if (promptData && process.env.OPENAI_API_KEY) {
            // Usar IA com prompt configurado para gerar resposta personalizada
            const promptTemplate = promptData.template || '';
            const vars = promptData.vars || {};
            
            // Preparar variáveis do prompt
            const promptVars = {
              customer_name: contactName,
              company_name: company.name,
              cardapio_url: cardapioUrl,
              cashback_percent: cashbackPercent.toString(),
              agent_name: vars.agent_name || `Assistente ${company.name}`,
              company_address: vars.company_address || 'Consulte nosso endereço',
              telefone: vars.telefone || 'Consulte nosso telefone',
              working_hours: vars.working_hours || 'Consulte nossos horários'
            };
            
            // Substituir variáveis no template
            let finalPrompt = promptTemplate;
            Object.keys(promptVars).forEach(key => {
              const regex = new RegExp(`{{${key}}}`, 'g');
              finalPrompt = finalPrompt.replace(regex, promptVars[key]);
            });
            
            try {
              const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    { role: 'system', content: finalPrompt },
                    { role: 'user', content: mensagemCliente }
                  ],
                  max_tokens: 300,
                  temperature: 0.7
                })
              });
              
              const openaiJson = await openaiResp.json();
              if (openaiJson.choices && openaiJson.choices[0] && openaiJson.choices[0].message) {
                resposta = openaiJson.choices[0].message.content;
                console.log('Resposta IA personalizada gerada:', resposta);
              } else {
                console.error('Erro na resposta da OpenAI:', openaiJson);
                resposta = `Oi ${contactName}! 👋 Bem-vindo ao ${company.name}! Temos um cashback de ${cashbackPercent}% esperando por você. 💸\n\nExplore nosso cardápio e aproveite essa vantagem! 🍕👉 ${cardapioUrl}`;
              }
            } catch (aiError) {
              console.error('Erro ao gerar resposta com IA:', aiError);
              resposta = `Oi ${contactName}! 👋 Bem-vindo ao ${company.name}! Temos um cashback de ${cashbackPercent}% esperando por você. 💸\n\nExplore nosso cardápio e aproveite essa vantagem! 🍕👉 ${cardapioUrl}`;
            }
          } else {
            // Fallback sem IA
            resposta = `Oi ${contactName}! 👋 Bem-vindo ao ${company.name}! Temos um cashback de ${cashbackPercent}% esperando por você. 💸\n\nExplore nosso cardápio e aproveite essa vantagem! 🍕👉 ${cardapioUrl}`;
          }
          
          console.log('Resposta de boas-vindas gerada:', resposta);
        } else {
          resposta = `Oi, ${contactName}! Tudo bem? Este é o nosso autoatendimento! 🤖\n\nhttps://pedido.dominio.tech`;
        }
      }

      // Se não conseguiu gerar boas-vindas ou não é primeira mensagem, usar IA padrão
      if (resposta === 'Olá! Sou o Assistente Domínio Pizzas! 🍕\n\nComo posso te ajudar hoje?\n\n🍽️ Confira nosso cardápio: https://pedido.dominio.tech/dominiopizzas' && process.env.OPENAI_API_KEY) {
        const iaPrompt = integration.ia_agent_preset || 'Você é um atendente virtual cordial e objetivo.';
        const iaModel = integration.ia_model || 'gpt-3.5-turbo';
        const iaTemperature = typeof integration.ia_temperature === 'number' ? integration.ia_temperature : 0.7;
        
        const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: iaModel,
            messages: [
              { role: 'system', content: iaPrompt },
              { role: 'user', content: mensagemCliente }
            ],
            max_tokens: 200,
            temperature: iaTemperature
          })
        });
        
        const openaiJson = await openaiResp.json();
        resposta = openaiJson.choices?.[0]?.message?.content?.trim() || resposta;
        console.log('Resposta gerada pela OpenAI padrão:', resposta);
      }
    } catch (err) {
      console.error('Erro ao gerar resposta automática:', err);
    }
  }

  // 🚫 BLOQUEIO TOTAL - NETLIFY WEBHOOK DESABILITADO
  console.log('🚫 NETLIFY WEBHOOK: Resposta bloqueada completamente');
  console.log('🚫 Mensagem que seria enviada:', resposta);
  console.log('🚫 Para:', from);
  
  return { statusCode: 200, body: JSON.stringify({ 
    message: 'Webhook processado mas resposta bloqueada',
    blocked_response: resposta,
    blocked_recipient: from
  })};

  // CÓDIGO ORIGINAL COMENTADO:
  if (false && from && integration.token && mensagemCliente) { // FORÇA FALSE PARA BLOQUEAR
    try {
      const resp = await fetch(`https://apinocode01.megaapi.com.br/rest/sendMessage/${instanceKey}/text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageData: {
            to: from,
            text: defangLinks(resposta),
            preview_url: false,
            linkPreview: false
          }
        })
      });
      const respJson = await resp.json().catch(() => ({}));
      console.log('Resposta MegaAPI:', resp.status, respJson);
      if (resp.status !== 200 || respJson.error) {
        console.error('Falha ao enviar resposta automática:', respJson);
      } else {
        console.log('Resposta automática enviada para', from);
        
        // Salvar resposta automática no banco
        try {
          const botMessageId = `bot_${Date.now()}_${Math.random()}`;
          const botTimestamp = new Date();
          const { data: botMessage, error: botMessageError } = await supabase
            .from('whatsapp_messages')
            .insert({
              company_id: integration.company_id,
              chat_id: from,
              contact_name: contactName,
              contact_phone: from,
              message_id: botMessageId,
              message_content: resposta,
              message_type: 'text',
              is_from_me: true,
              status: 'sent',
              timestamp: botTimestamp.toISOString()
            })
            .select();

          if (botMessageError) {
            console.error('Erro ao salvar resposta do bot:', botMessageError);
          } else {
            console.log('Resposta do bot salva:', botMessage);
          }

          // Atualizar chat com a resposta do bot
          const { error: updateChatError } = await supabase
            .from('whatsapp_chats')
            .update({
              last_message: resposta,
              last_message_time: botTimestamp.toISOString(),
              unread_count: 0,
              updated_at: botTimestamp.toISOString()
            })
            .eq('company_id', integration.company_id)
            .eq('chat_id', from);

          if (updateChatError) {
            console.error('Erro ao atualizar chat com resposta do bot:', updateChatError);
          } else {
            console.log('Chat atualizado com resposta do bot');
          }
        } catch (err) {
          console.error('Erro ao salvar resposta do bot no banco:', err);
        }
      }
    } catch (err) {
      console.error('Erro ao enviar resposta automática:', err);
    }
  } else {
    console.warn('Dados insuficientes para resposta automática:', { from, instanceKey, token: integration.token, mensagem: mensagemCliente });
  }

  return { statusCode: 200, body: 'ok' };
};
