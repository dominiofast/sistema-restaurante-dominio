// MODIFICAÇÃO NO WEBHOOK PARA SUPORTAR PAUSE/RESUME
// Adicionar esta verificação no início da função principal do webhook

// No arquivo api/webhook.js, adicionar após a linha de identificação do remetente:

// VERIFICAR SE ASSISTENTE ESTÁ PAUSADO PARA ESTE NÚMERO
async function isAssistantPaused(supabase, companyId, phone) {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    const { data, error } = await supabase
      .rpc('get_assistant_status', {
        p_company_id: companyId,
        p_phone: cleanPhone
      });

    if (error) {
      console.error('Erro ao verificar status do assistente:', error);
      return false; // Em caso de erro, assume não pausado
    }

    return data?.is_paused || false;
  } catch (error) {
    console.error('Erro na verificação de pausa:', error);
    return false;
  }
}

// MODIFICAÇÃO NO FLUXO PRINCIPAL DO WEBHOOK:
// Substituir a seção de processamento da mensagem por:

exports.handler = async (event, context) => {
  // ... código existente até identificar remetente ...
  
  const from = data.key?.remoteJid || data.from;
  const mensagemCliente = data.message?.conversation || 
                         data.message?.extendedTextMessage?.text || '';
  
  if (from && mensagemCliente) {
    try {
      // ... código de salvar mensagem no banco ...
      
      // NOVA VERIFICAÇÃO: Assistente pausado?
      const assistantPaused = await isAssistantPaused(supabase, integration.company_id, from);
      
      if (assistantPaused) {
        console.log(`🔴 ASSISTENTE PAUSADO para ${from} - Mensagem salva mas não processada`);
        
        // Salvar log de mensagem não processada
        await supabase
          .from('ai_conversation_logs')
          .insert({
            company_id: integration.company_id,
            customer_phone: from,
            customer_name: contactName || 'Desconhecido',
            message_content: `MENSAGEM NÃO PROCESSADA (IA PAUSADA): ${mensagemCliente}`,
            message_type: 'message_skipped_paused',
            created_at: new Date().toISOString()
          });
        
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            message: 'Mensagem salva - Assistente pausado',
            paused: true 
          })
        };
      }
      
      // Se não estiver pausado, continuar processamento normal
      console.log(`✅ ASSISTENTE ATIVO para ${from} - Processando mensagem`);
      
      // ... resto do código de processamento IA existente ...
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro interno' })
      };
    }
  }
  
  // ... resto do código existente ...
};

// EXEMPLOS DE ENDPOINTS PARA A EXTENSÃO:

// 1. ENDPOINT PARA PAUSAR (criar em api/pause-assistant.js)
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { phone, company_id, paused_by } = JSON.parse(event.body);
    
    const { data, error } = await supabase
      .rpc('pause_whatsapp_assistant', {
        p_company_id: company_id,
        p_phone: phone,
        p_paused_by: paused_by
      });

    if (error) throw error;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// 2. ENDPOINT PARA RETOMAR (criar em api/resume-assistant.js)
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { phone, company_id } = JSON.parse(event.body);
    
    const { data, error } = await supabase
      .rpc('resume_whatsapp_assistant', {
        p_company_id: company_id,
        p_phone: phone
      });

    if (error) throw error;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// 3. ENDPOINT PARA STATUS (criar em api/assistant-status.js)
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { phone, company_id } = event.queryStringParameters;
    
    const { data, error } = await supabase
      .rpc('get_assistant_status', {
        p_company_id: company_id,
        p_phone: phone
      });

    if (error) throw error;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// 4. ENDPOINT PARA DADOS DO CLIENTE (criar em api/customer-info.js)
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { phone, company_id } = event.queryStringParameters;
    
    const { data, error } = await supabase
      .rpc('get_customer_info', {
        p_company_id: company_id,
        p_phone: phone
      });

    if (error) throw error;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
