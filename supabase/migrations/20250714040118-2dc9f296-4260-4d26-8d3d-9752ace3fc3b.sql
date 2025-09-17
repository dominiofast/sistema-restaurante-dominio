-- Atualizar função para incluir notificação de entrega
CREATE OR REPLACE FUNCTION public.send_whatsapp_ready_notification()
RETURNS TRIGGER AS $$
DECLARE
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
    pedido_itens_text TEXT := '';
    item_record RECORD;
    notification_type TEXT;
    log_type TEXT;
BEGIN
    -- Verificar se o status mudou
    IF OLD.status != NEW.status THEN
        
        -- Determinar tipo de notificação
        IF (LOWER(NEW.status) LIKE '%pronto%' OR 
            LOWER(NEW.status) LIKE '%ready%' OR
            NEW.status = 'pronto_entrega') THEN
            notification_type := 'pronto';
            log_type := 'ready_notification';
        ELSIF (LOWER(NEW.status) LIKE '%entregue%' OR 
               LOWER(NEW.status) LIKE '%delivered%' OR
               NEW.status = 'entregue') THEN
            notification_type := 'entregue';
            log_type := 'delivered_notification';
        ELSE
            RETURN NEW; -- Status não relevante
        END IF;
        
        -- Verificar se já enviamos notificação deste tipo para este pedido
        IF EXISTS (
            SELECT 1 FROM ai_conversation_logs 
            WHERE company_id = NEW.company_id 
            AND customer_phone = NEW.telefone 
            AND message_type = log_type
            AND message_content LIKE '%#' || NEW.id || '%'
        ) THEN
            RETURN NEW;
        END IF;
        
        -- Buscar integração WhatsApp
        SELECT * INTO whatsapp_integration 
        FROM whatsapp_integrations 
        WHERE company_id = NEW.company_id
        LIMIT 1;
        
        IF NOT FOUND THEN
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                NEW.company_id, NEW.telefone, NEW.nome,
                'ERRO: Integração WhatsApp não encontrada para notificação de ' || notification_type, 'notification_error', now()
            );
            RETURN NEW;
        END IF;
        
        -- Buscar itens do pedido
        FOR item_record IN 
            SELECT nome_produto, quantidade, valor_total
            FROM pedido_itens 
            WHERE pedido_id = NEW.id
            ORDER BY created_at
        LOOP
            pedido_itens_text := pedido_itens_text || 
                '• ' || item_record.quantidade || 'x ' || item_record.nome_produto || E'\n';
        END LOOP;
        
        -- Mensagem baseada no tipo
        IF notification_type = 'pronto' THEN
            message_text := '🍕 *PEDIDO PRONTO!* 🚀' || E'\n\n' ||
                           '📋 *Pedido:* #' || NEW.id || E'\n' ||
                           '👤 *Cliente:* ' || COALESCE(NEW.nome, 'Não informado') || E'\n\n';
            
            IF NEW.tipo = 'delivery' THEN
                message_text := message_text || '🚗 *Saindo para entrega!*' || E'\n' ||
                    'Tempo estimado: 15-25 minutos' || E'\n\n';
            ELSE
                message_text := message_text || '🏪 *Pronto para retirada!*' || E'\n' ||
                    'Pode vir buscar quando quiser!' || E'\n\n';
            END IF;
            
        ELSIF notification_type = 'entregue' THEN
            message_text := '✅ *PEDIDO ENTREGUE!* 🎉' || E'\n\n' ||
                           '📋 *Pedido:* #' || NEW.id || E'\n' ||
                           '👤 *Cliente:* ' || COALESCE(NEW.nome, 'Não informado') || E'\n\n' ||
                           '🚚 *Seu pedido foi entregue com sucesso!*' || E'\n\n' ||
                           'Esperamos que tenha gostado!' || E'\n';
        END IF;
        
        message_text := message_text || 'Obrigado pela preferência! 😊';
        
        -- Enviar via API
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
                        'to', NEW.telefone,
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
            NEW.company_id, NEW.telefone, NEW.nome,
            UPPER(notification_type) || ': ' || message_text || ' | Resposta API: ' || COALESCE(api_response, 'N/A'),
            log_type, now()
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;