-- NOTIFICAÇÃO DE PRODUÇÃO CORRIGIDA
-- Verificar se mudou de "analise" para "producao"

CREATE OR REPLACE FUNCTION notify_production_status()
RETURNS TRIGGER AS $$
DECLARE
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_company_name TEXT;
BEGIN
    -- Verificar se mudou de "analise" para "producao"
    IF OLD.status = 'analise' AND NEW.status = 'producao' THEN
        
        -- Buscar integracao WhatsApp (corrigir campo active/is_active)
        SELECT * INTO v_whatsapp_integration
        FROM whatsapp_integrations
        WHERE company_id = NEW.company_id AND is_active = true
        LIMIT 1;
        
        IF NOT FOUND THEN 
            -- Log caso não encontre integração
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                NEW.company_id, NEW.telefone, NEW.nome,
                'PRODUÇÃO: WhatsApp não configurado para empresa ' || NEW.company_id,
                'production_notification_error', now()
            );
            RETURN NEW; 
        END IF;
        
        -- Buscar nome da empresa
        SELECT name INTO v_company_name
        FROM companies WHERE id = NEW.company_id;
        
        -- Montar mensagem simples e empolgante
        v_message_text := 
            '🥳 *Agora vai! Seu pedido já está em produção!* 🍕' || E'\n\n' ||
            '📋 *Pedido n°* ' || COALESCE(NEW.numero_pedido::text, NEW.id::text) || E'\n' ||
            '👤 *Cliente:* ' || NEW.nome || E'\n\n' ||
            '🔥 Nossa equipe está preparando seu pedido com muito carinho!' || E'\n' ||
            '⏰ Em breve você receberá uma nova notificação quando estiver pronto.' || E'\n\n' ||
            '🏪 *' || COALESCE(v_company_name, 'Estabelecimento') || '*' || E'\n' ||
            '🙏 Obrigado pela sua paciência!';
        
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
            'NOTIFICAÇÃO PRODUÇÃO ENVIADA: ' || v_message_text,
            'production_notification',
            now()
        );
        
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            COALESCE(NEW.company_id, OLD.company_id), 
            COALESCE(NEW.telefone, OLD.telefone), 
            COALESCE(NEW.nome, OLD.nome),
            'ERRO NOTIFICAÇÃO PRODUÇÃO: ' || SQLERRM,
            'production_notification_error', now()
        );
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_notify_production ON pedidos;

-- Criar trigger corrigido
CREATE TRIGGER trigger_notify_production
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_production_status();