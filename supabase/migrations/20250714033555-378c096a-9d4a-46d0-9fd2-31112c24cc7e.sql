-- Primeiro, vamos verificar se a tabela existe e tem a estrutura correta
\d pedido_itens;

-- Recriar a função desde o início
CREATE OR REPLACE FUNCTION public.send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    pedido_record RECORD;
    notification_config RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
BEGIN
    RAISE NOTICE 'Trigger executado para pedido_id: %', NEW.pedido_id;
    
    -- Buscar dados do pedido
    SELECT * INTO pedido_record FROM pedidos WHERE id = NEW.pedido_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Pedido não encontrado: %', NEW.pedido_id;
        RETURN NEW;
    END IF;
    
    RAISE NOTICE 'Pedido encontrado - Cliente: %, Telefone: %', pedido_record.nome, pedido_record.telefone;
    
    -- Verificar se já enviamos notificação para este pedido
    IF EXISTS (
        SELECT 1 FROM ai_conversation_logs 
        WHERE company_id = pedido_record.company_id 
        AND customer_phone = pedido_record.telefone 
        AND message_content LIKE '%WHATSAPP PEDIDO COMPLETO:%' 
        AND message_content LIKE '%#' || pedido_record.id || '%'
        AND created_at >= pedido_record.created_at - INTERVAL '1 hour'
    ) THEN
        RAISE NOTICE 'Notificação já enviada para pedido %', pedido_record.id;
        RETURN NEW;
    END IF;
    
    -- Buscar configuração de notificações
    SELECT * INTO notification_config 
    FROM whatsapp_order_notifications 
    WHERE company_id = pedido_record.company_id AND is_active = true;
    
    IF NOT FOUND OR NOT notification_config.send_confirmation THEN
        RAISE NOTICE 'Configuração de notificação não encontrada ou inativa';
        RETURN NEW;
    END IF;
    
    -- Buscar integração WhatsApp ativa
    SELECT * INTO whatsapp_integration 
    FROM whatsapp_integrations 
    WHERE company_id = pedido_record.company_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Integração WhatsApp não encontrada';
        RETURN NEW;
    END IF;
    
    RAISE NOTICE 'Preparando para enviar notificação WhatsApp...';
    
    -- Mensagem simples para teste
    message_text := '🧪 TESTE TRIGGER - Pedido #' || pedido_record.id || ' confirmado!';
    
    -- Log da tentativa
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        pedido_record.company_id,
        pedido_record.telefone,
        pedido_record.nome,
        'TRIGGER TESTE: ' || message_text,
        'notification_sent',
        now()
    );
    
    RAISE NOTICE 'Log criado com sucesso';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger novamente
CREATE TRIGGER trigger_whatsapp_notification_after_items
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- Verificar se foi criado
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'pedido_itens';