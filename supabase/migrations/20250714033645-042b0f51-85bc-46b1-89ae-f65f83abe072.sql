-- Recriar a função com logs para debug
CREATE OR REPLACE FUNCTION public.send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    pedido_record RECORD;
    notification_config RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
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
        AND message_content LIKE '%TRIGGER TESTE:%' 
        AND message_content LIKE '%#' || pedido_record.id || '%'
    ) THEN
        RETURN NEW;
    END IF;
    
    -- Buscar configuração de notificações
    SELECT * INTO notification_config 
    FROM whatsapp_order_notifications 
    WHERE company_id = pedido_record.company_id AND is_active = true;
    
    IF NOT FOUND OR NOT notification_config.send_confirmation THEN
        -- Log que a configuração não foi encontrada
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            pedido_record.company_id, pedido_record.telefone, pedido_record.nome,
            'ERRO: Configuração de notificação não encontrada ou inativa', 'notification_error', now()
        );
        RETURN NEW;
    END IF;
    
    -- Buscar integração WhatsApp ativa
    SELECT * INTO whatsapp_integration 
    FROM whatsapp_integrations 
    WHERE company_id = pedido_record.company_id;
    
    IF NOT FOUND THEN
        -- Log que a integração não foi encontrada
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            pedido_record.company_id, pedido_record.telefone, pedido_record.nome,
            'ERRO: Integração WhatsApp não encontrada', 'notification_error', now()
        );
        RETURN NEW;
    END IF;
    
    -- Mensagem simples para teste
    message_text := 'TESTE TRIGGER - Pedido #' || pedido_record.id || ' confirmado!';
    
    -- Log da tentativa
    INSERT INTO ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        pedido_record.company_id, pedido_record.telefone, pedido_record.nome,
        'TRIGGER TESTE: ' || message_text, 'notification_sent', now()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_whatsapp_notification_after_items ON pedido_itens;

-- Criar o trigger
CREATE TRIGGER trigger_whatsapp_notification_after_items
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- Verificar se foi criado
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_whatsapp_notification_after_items';