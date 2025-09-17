-- Criar function para enviar notificação WhatsApp quando pedido for criado
CREATE OR REPLACE FUNCTION public.send_whatsapp_order_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_config RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
BEGIN
    -- Buscar configuração de notificações
    SELECT * INTO notification_config 
    FROM whatsapp_order_notifications 
    WHERE company_id = NEW.company_id AND is_active = true;
    
    -- Se não há configuração ativa, não fazer nada
    IF NOT FOUND OR NOT notification_config.send_confirmation THEN
        RETURN NEW;
    END IF;
    
    -- Buscar integração WhatsApp ativa
    SELECT * INTO whatsapp_integration 
    FROM whatsapp_integrations 
    WHERE company_id = NEW.company_id;
    
    -- Se não há integração WhatsApp, não fazer nada
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Preparar mensagem de confirmação
    message_text := notification_config.confirmation_template;
    message_text := REPLACE(message_text, '{order_number}', NEW.id::text);
    message_text := REPLACE(message_text, '{total}', COALESCE(NEW.total::text, '0.00'));
    message_text := REPLACE(message_text, '{estimated_time}', '30-45');
    
    -- Log da notificação (por enquanto apenas log - posteriormente integrar com API WhatsApp)
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        NEW.company_id,
        NEW.telefone,
        NEW.nome,
        'NOTIFICAÇÃO AUTOMÁTICA: ' || message_text,
        'notification_sent',
        now()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para notificações automáticas
CREATE TRIGGER trigger_send_whatsapp_notification
    AFTER INSERT ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_order_notification();