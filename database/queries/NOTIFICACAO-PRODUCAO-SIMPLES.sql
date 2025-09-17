-- NOTIFICACAO SIMPLES PARA PRODUCAO
-- Apenas aviso que pedido esta sendo preparado

CREATE OR REPLACE FUNCTION notify_production_status()
RETURNS TRIGGER AS $$
DECLARE
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
BEGIN
    -- Verificar se mudou de "analise" para "producao"
    IF OLD.status = 'analise' AND NEW.status = 'producao' THEN
        
        -- Buscar integracao WhatsApp
        SELECT * INTO v_whatsapp_integration
        FROM whatsapp_integrations
        WHERE company_id = NEW.company_id AND is_active = true
        LIMIT 1;
        
        IF NOT FOUND THEN RETURN NEW; END IF;
        
        -- Mensagem simples
        v_message_text := 
            'Seu pedido ja esta em producao! 🍕' || E'\n' ||
            'Pedido n° ' || NEW.numero_pedido || ' sendo preparado com carinho 👨‍🍳';
        
        -- Enviar mensagem via WhatsApp
        SELECT content INTO v_api_response
        FROM http((
            'POST',
            'https://apinocode01.megaapi.com.br/rest/sendMessage/' || v_whatsapp_integration.instance_key || '/text',
            ARRAY[
                http_header('Authorization', 'Bearer ' || v_whatsapp_integration.token),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'messageData', json_build_object(
                    'to', NEW.telefone,
                    'text', v_message_text
                )
            )::text
        ));
        
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_notify_production ON pedidos;
CREATE TRIGGER trigger_notify_production
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_production_status();
