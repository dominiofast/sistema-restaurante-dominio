-- CORRIGIR TRIGGER - REMOVER is_active
CREATE OR REPLACE FUNCTION notify_production_status()
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
        'DEBUG: Trigger executado - Status OLD: ' || COALESCE(OLD.status, 'NULL') || ' -> NEW: ' || COALESCE(NEW.status, 'NULL'),
        'debug_production_trigger', now()
    );

    -- Verificar se mudou de "analise" para "producao"
    IF OLD.status = 'analise' AND NEW.status = 'producao' THEN
        
        -- Log da condição atendida
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'PRODUÇÃO: Condição atendida - buscando WhatsApp',
            'production_status_change', now()
        );
        
        -- Buscar integracao WhatsApp (SEM is_active)
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
                'production_error', now()
            );
            RETURN NEW; 
        END IF;
        
        -- Log WhatsApp encontrado
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'WhatsApp encontrado: ' || v_whatsapp_integration.instance_key,
            'production_whatsapp_found', now()
        );
        
        -- Montar mensagem
        v_message_text := 
            '🥳 *Agora vai! Seu pedido já está em produção!* 🍕' || E'\n\n' ||
            '📋 *Pedido n°* ' || COALESCE(NEW.numero_pedido::text, NEW.id::text) || E'\n' ||
            '👤 *Cliente:* ' || NEW.nome || E'\n\n' ||
            '🔥 Nossa equipe está preparando seu pedido com muito carinho!' || E'\n' ||
            '⏰ Em breve você receberá uma nova notificação quando estiver pronto.';
        
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
            'SUCESSO: Notificação de produção enviada via WhatsApp!',
            'production_sent', now()
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
            'ERRO CRÍTICO: ' || SQLERRM,
            'production_critical_error', now()
        );
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;