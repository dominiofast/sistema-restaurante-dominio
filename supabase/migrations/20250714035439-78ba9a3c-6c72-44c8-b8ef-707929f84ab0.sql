-- Remover trigger antigo que dispara no INSERT
DROP TRIGGER IF EXISTS trigger_send_whatsapp_notification ON pedidos;

-- Remover trigger de itens também 
DROP TRIGGER IF EXISTS trigger_send_whatsapp_notification_after_items ON pedido_itens;

-- Criar novo trigger que dispara quando status muda para "pronto"
CREATE OR REPLACE FUNCTION public.send_whatsapp_ready_notification()
RETURNS TRIGGER AS $$
DECLARE
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
    pedido_itens_text TEXT := '';
    item_record RECORD;
BEGIN
    -- Verificar se o status mudou para "pronto" ou similar
    IF OLD.status != NEW.status AND (
        LOWER(NEW.status) LIKE '%pronto%' OR 
        LOWER(NEW.status) LIKE '%ready%' OR
        NEW.status = 'pronto_entrega'
    ) THEN
        
        -- Verificar se já enviamos notificação de "pronto" para este pedido
        IF EXISTS (
            SELECT 1 FROM ai_conversation_logs 
            WHERE company_id = NEW.company_id 
            AND customer_phone = NEW.telefone 
            AND message_content LIKE '%PEDIDO PRONTO:%'
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
                'ERRO: Integração WhatsApp não encontrada para notificação de pronto', 'notification_error', now()
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
        
        -- Mensagem de pedido pronto
        message_text := '🍕 *PEDIDO PRONTO PARA ENTREGA!* 🚀' || E'\n\n' ||
                       '📋 *Pedido:* #' || NEW.id || E'\n' ||
                       '👤 *Cliente:* ' || COALESCE(NEW.nome, 'Não informado') || E'\n';
        
        IF NEW.endereco IS NOT NULL THEN
            message_text := message_text || '📍 *Endereço:* ' || NEW.endereco || E'\n';
        END IF;
        
        message_text := message_text || E'\n' ||
            '📝 *ITENS:*' || E'\n' ||
            pedido_itens_text || E'\n' ||
            '💰 *TOTAL: R$ ' || REPLACE(COALESCE(NEW.total, 0)::text, '.', ',') || '*' || E'\n\n';
        
        IF NEW.tipo = 'delivery' THEN
            message_text := message_text || '🚗 *Seu pedido está saindo para entrega!*' || E'\n' ||
                'Tempo estimado: 15-25 minutos' || E'\n\n';
        ELSE
            message_text := message_text || '🏪 *Seu pedido está pronto para retirada!*' || E'\n' ||
                'Pode vir buscar quando quiser!' || E'\n\n';
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
            'PEDIDO PRONTO: ' || message_text || ' | Resposta API: ' || COALESCE(api_response, 'N/A'),
            'ready_notification', now()
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para UPDATE de status
CREATE TRIGGER trigger_send_whatsapp_ready_notification
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_ready_notification();