-- CRIAR TRIGGER PARA NOTIFICAÇÃO DE PEDIDO PRONTO
CREATE OR REPLACE FUNCTION notify_ready_status()
RETURNS TRIGGER AS $$
DECLARE
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
BEGIN
    -- Debug: sempre logar quando trigger é executado
    INSERT INTO ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        NEW.company_id, NEW.telefone, NEW.nome,
        'DEBUG: Trigger PRONTO executado - Status OLD: ' || COALESCE(OLD.status, 'NULL') || ' -> NEW: ' || COALESCE(NEW.status, 'NULL') || ' | Tipo: ' || COALESCE(NEW.tipo, 'NULL'),
        'debug_ready_trigger', now()
    );

    -- Verificar se mudou de "producao" para "pronto"
    IF OLD.status = 'producao' AND NEW.status = 'pronto' THEN
        
        -- Log da condição atendida
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'PRONTO: Condição atendida - buscando WhatsApp para tipo: ' || NEW.tipo,
            'ready_status_change', now()
        );
        
        -- Buscar integracao WhatsApp
        SELECT * INTO v_whatsapp_integration
        FROM whatsapp_integrations
        WHERE company_id = NEW.company_id 
        AND purpose = 'primary'
        LIMIT 1;
        
        IF NOT FOUND THEN 
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                NEW.company_id, NEW.telefone, NEW.nome,
                'ERRO: WhatsApp não configurado para empresa ' || NEW.company_id,
                'ready_error', now()
            );
            RETURN NEW; 
        END IF;
        
        -- Log WhatsApp encontrado
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'WhatsApp encontrado para notificação PRONTO: ' || v_whatsapp_integration.instance_key,
            'ready_whatsapp_found', now()
        );
        
        -- Montar mensagem baseada no tipo do pedido
        IF NEW.tipo = 'balcao' OR NEW.tipo = 'ficha' THEN
            -- Mensagem para retirada no balcão
            v_message_text := 
                '✅ *Seu pedido está pronto para retirada!* 🎉' || E'\n\n' ||
                '📋 *Pedido n°* ' || COALESCE(NEW.numero_pedido::text, NEW.id::text) || E'\n' ||
                '👤 *Cliente:* ' || NEW.nome || E'\n\n' ||
                '🏪 *Pode vir buscar no balcão!* ' || E'\n' ||
                '⏰ Seu pedido está quentinho esperando por você!' || E'\n\n' ||
                'Obrigado pela preferência! 😊';
        ELSE
            -- Mensagem para delivery (saiu para entrega)
            v_message_text := 
                '🚗 *Seu pedido saiu para entrega!* 📦' || E'\n\n' ||
                '📋 *Pedido n°* ' || COALESCE(NEW.numero_pedido::text, NEW.id::text) || E'\n' ||
                '👤 *Cliente:* ' || NEW.nome || E'\n' ||
                '📍 *Endereço:* ' || COALESCE(NEW.endereco, 'Não informado') || E'\n\n' ||
                '🏍️ *Nossa equipe já está a caminho!* ' || E'\n' ||
                '⏰ Em breve você receberá seu pedido quentinho!' || E'\n\n' ||
                'Aguarde na porta, já estamos chegando! 😊';
        END IF;
        
        -- Enviar WhatsApp
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
        
        -- Log sucesso
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'SUCESSO: Notificação de PRONTO enviada via WhatsApp para tipo: ' || NEW.tipo,
            'ready_sent', now()
        );
        
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            COALESCE(NEW.company_id, OLD.company_id), 
            COALESCE(NEW.telefone, OLD.telefone), 
            COALESCE(NEW.nome, OLD.nome),
            'ERRO CRÍTICO PRONTO: ' || SQLERRM,
            'ready_critical_error', now()
        );
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para notificação de pedido pronto
DROP TRIGGER IF EXISTS trigger_notify_ready ON pedidos;
CREATE TRIGGER trigger_notify_ready
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_ready_status();