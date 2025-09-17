-- Atualizar a função para enviar mensagens WhatsApp reais
CREATE OR REPLACE FUNCTION public.send_whatsapp_order_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_config RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
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
    
    -- Chamar edge function para enviar WhatsApp via HTTP
    BEGIN
        SELECT content INTO api_response
        FROM http((
            'POST',
            'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/send-whatsapp-message',
            ARRAY[http_header('Content-Type', 'application/json'), http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.VKg3vWCKDqeZ3EV6ZGgCHdLx2jrFmKzfZGj6BFLobXI')],
            'application/json',
            json_build_object(
                'phone', NEW.telefone,
                'message', message_text,
                'integration', json_build_object(
                    'host', whatsapp_integration.host,
                    'token', whatsapp_integration.token,
                    'instance_key', whatsapp_integration.instance_key
                )
            )::text
        ));
    EXCEPTION
        WHEN OTHERS THEN
            -- Se falhar o envio, apenas logar o erro
            api_response := 'Erro: ' || SQLERRM;
    END;
    
    -- Log da notificação
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
        'WHATSAPP ENVIADO: ' || message_text || ' | Resposta API: ' || COALESCE(api_response, 'N/A'),
        'notification_sent',
        now()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;