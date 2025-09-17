-- Função simplificada que usa exatamente o mesmo método das conversações
CREATE OR REPLACE FUNCTION public.send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    pedido_record RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
    pedido_itens_text TEXT := '';
    item_record RECORD;
BEGIN
    -- Buscar dados do pedido
    SELECT * INTO pedido_record FROM pedidos WHERE id = NEW.pedido_id;
    
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Verificar se já enviamos notificação para este pedido
    IF EXISTS (
        SELECT 1 FROM ai_conversation_logs 
        WHERE company_id = pedido_record.company_id 
        AND customer_phone = pedido_record.telefone 
        AND message_content LIKE '%WHATSAPP DIRETO:%'
        AND message_content LIKE '%#' || pedido_record.id || '%'
    ) THEN
        RETURN NEW;
    END IF;
    
    -- Buscar integração WhatsApp - MESMO MÉTODO do webhook
    SELECT * INTO whatsapp_integration 
    FROM whatsapp_integrations 
    WHERE company_id = pedido_record.company_id
    LIMIT 1;
    
    IF NOT FOUND THEN
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            pedido_record.company_id, pedido_record.telefone, pedido_record.nome,
            'ERRO: Integração WhatsApp não encontrada', 'notification_error', now()
        );
        RETURN NEW;
    END IF;
    
    -- Buscar itens do pedido
    FOR item_record IN 
        SELECT nome_produto, quantidade, valor_total
        FROM pedido_itens 
        WHERE pedido_id = NEW.pedido_id
        ORDER BY created_at
    LOOP
        pedido_itens_text := pedido_itens_text || 
            '• ' || item_record.quantidade || 'x ' || item_record.nome_produto || 
            ' - R$ ' || REPLACE(item_record.valor_total::text, '.', ',') || E'\n';
    END LOOP;
    
    -- Mensagem completa
    message_text := '🛍️ *CONFIRMAÇÃO DE PEDIDO* 🛍️' || E'\n\n' ||
                   '📋 *Pedido:* #' || pedido_record.id || E'\n' ||
                   '👤 *Cliente:* ' || COALESCE(pedido_record.nome, 'Não informado') || E'\n' ||
                   '📞 *Telefone:* ' || COALESCE(pedido_record.telefone, 'Não informado') || E'\n';
    
    IF pedido_record.endereco IS NOT NULL THEN
        message_text := message_text || '📍 *Endereço:* ' || pedido_record.endereco || E'\n';
    END IF;
    
    message_text := message_text || 
        '🚚 *Tipo:* ' || COALESCE(UPPER(pedido_record.tipo), 'N/A') || E'\n' ||
        '💳 *Pagamento:* ' || COALESCE(UPPER(pedido_record.pagamento), 'N/A') || E'\n\n' ||
        '📝 *ITENS DO PEDIDO:*' || E'\n' ||
        pedido_itens_text || E'\n' ||
        '💰 *TOTAL: R$ ' || REPLACE(COALESCE(pedido_record.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
        '⏰ *Tempo estimado:* 30-45 minutos' || E'\n\n' ||
        '✅ Seu pedido foi confirmado e já está sendo preparado!' || E'\n' ||
        'Obrigado pela preferência! 😊';
    
    -- Enviar via API - EXATAMENTE IGUAL ao webhook.js
    BEGIN
        SELECT content INTO api_response
        FROM http((
            'POST',
            'https://apinocode01.megaapi.com.br/rest/sendMessage/' || whatsapp_integration.instance_key || '/text',
            ARRAY[
                http_header('Authorization', 'Bearer ' || whatsapp_integration.token),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'messageData', json_build_object(
                    'to', pedido_record.telefone,
                    'text', message_text
                )
            )::text
        ));
    EXCEPTION
        WHEN OTHERS THEN
            api_response := 'Erro: ' || SQLERRM;
    END;
    
    -- Log da notificação
    INSERT INTO ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        pedido_record.company_id, pedido_record.telefone, pedido_record.nome,
        'WHATSAPP DIRETO: ' || message_text || ' | Resposta API: ' || COALESCE(api_response, 'N/A'),
        'notification_sent', now()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;