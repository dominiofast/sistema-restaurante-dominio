-- Recriar as funções SEM defang_links

CREATE OR REPLACE FUNCTION public.send_whatsapp_ready_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    api_response text;
    message_text text;
    whatsapp_config record;
BEGIN
    -- Buscar configuração do WhatsApp da empresa
    SELECT host, token, instance_key INTO whatsapp_config
    FROM whatsapp_integrations 
    WHERE company_id = NEW.company_id AND is_active = true
    LIMIT 1;
    
    -- Se não há configuração ativa, sair
    IF whatsapp_config IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Preparar mensagem limpa
    message_text := 'Seu pedido está pronto! 🍕';
    
    BEGIN
        SELECT content INTO api_response
        FROM http((
            'POST',
            'https://' || whatsapp_config.host || '/rest/sendMessage/' || whatsapp_config.instance_key || '/text',
            ARRAY[
                http_header('Authorization', 'Bearer ' || whatsapp_config.token),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'messageData', json_build_object(
                    'to', NEW.telefone,
                    'text', message_text,
                    'preview_url', false,
                    'linkPreview', false
                )
            )::text
        ));
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$;