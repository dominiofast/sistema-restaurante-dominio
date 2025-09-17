-- CORRIGIR FUNÇÕES PARA SALVAR MENSAGENS NO CHAT
-- Execute no SQL Editor do Supabase

-- 1. RECRIAR FUNÇÃO DE PRODUÇÃO COM SALVAMENTO CORRETO
CREATE OR REPLACE FUNCTION notify_production_status()
RETURNS TRIGGER AS $$
DECLARE
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_company_name TEXT;
    v_message_id TEXT;
    v_timestamp TIMESTAMP;
    v_chat_id TEXT;
BEGIN
    -- Verificar se mudou de "analise" para "producao"
    IF OLD.status = 'analise' AND NEW.status = 'producao' THEN
        
        -- Log da mudança
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'PRODUÇÃO: Status mudou de analise -> producao para pedido #' || COALESCE(NEW.numero_pedido::text, NEW.id::text),
            'production_status_change', now()
        );
        
        -- Buscar integração WhatsApp
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
                'production_notification_error', now()
            );
            RETURN NEW; 
        END IF;
        
        -- Buscar nome da empresa
        SELECT name INTO v_company_name
        FROM companies WHERE id = NEW.company_id;
        
        -- Montar mensagem
        v_message_text := 
            '🥳 *Agora vai! Seu pedido já está em produção!* 🍕' || E'\n\n' ||
            '📋 *Pedido n°* ' || COALESCE(NEW.numero_pedido::text, NEW.id::text) || E'\n' ||
            '👤 *Cliente:* ' || NEW.nome || E'\n\n' ||
            '🔥 Nossa equipe está preparando seu pedido com muito carinho!' || E'\n' ||
            '⏰ Em breve você receberá uma nova notificação quando estiver pronto.' || E'\n\n' ||
            '🏪 *' || COALESCE(v_company_name, 'Estabelecimento') || '*' || E'\n' ||
            '🙏 Obrigado pela sua paciência!';
        
        -- Gerar IDs para a mensagem
        v_message_id := 'notify_prod_' || NEW.id || '_' || extract(epoch from now()) || '_' || (random() * 1000)::int;
        v_timestamp := now();
        v_chat_id := regexp_replace(NEW.telefone, '[^0-9]', '', 'g') || '@s.whatsapp.net';
        
        -- 1. ENVIAR VIA WHATSAPP API PRIMEIRO
        BEGIN
            SELECT content INTO v_api_response
            FROM http((
                'POST',
                'https://apinocode01.megaapi.com.br/rest/sendMessage/' || v_whatsapp_integration.instance_key || '/text',
                ARRAY[http_header('Content-Type', 'application/json'), http_header('apikey', v_whatsapp_integration.api_key)],
                'application/json',
                json_build_object(
                    'number', NEW.telefone,
                    'text', v_message_text
                )::text
            ));
            
            -- Log de sucesso
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                NEW.company_id, NEW.telefone, NEW.nome,
                'PRODUÇÃO ENVIADA: WhatsApp enviado com sucesso!',
                'production_whatsapp_sent', now()
            );
            
        EXCEPTION WHEN OTHERS THEN
            v_api_response := 'Erro: ' || SQLERRM;
            
            -- Log de erro
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                NEW.company_id, NEW.telefone, NEW.nome,
                'ERRO WHATSAPP: ' || SQLERRM,
                'production_whatsapp_error', now()
            );
        END;
        
        -- 2. SALVAR MENSAGEM NO BANCO (mesmo se WhatsApp falhar)
        BEGIN
            INSERT INTO whatsapp_messages (
                company_id,
                chat_id,
                contact_name,
                contact_phone,
                message_id,
                message_content,
                message_type,
                is_from_me,
                status,
                timestamp
            ) VALUES (
                NEW.company_id,
                v_chat_id,
                NEW.nome,
                NEW.telefone,
                v_message_id,
                v_message_text,
                'text',
                true,
                'sent',
                v_timestamp
            );
            
            -- Log de salvamento
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                NEW.company_id, NEW.telefone, NEW.nome,
                'PRODUÇÃO SALVA: Mensagem salva na tabela whatsapp_messages',
                'production_message_saved', now()
            );
            
        EXCEPTION WHEN OTHERS THEN
            -- Log de erro de salvamento
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                NEW.company_id, NEW.telefone, NEW.nome,
                'ERRO SALVAMENTO: ' || SQLERRM,
                'production_save_error', now()
            );
        END;
        
        -- 3. ATUALIZAR/CRIAR CHAT
        BEGIN
            INSERT INTO whatsapp_chats (
                company_id,
                chat_id,
                contact_name,
                contact_phone,
                last_message,
                last_message_time,
                updated_at,
                unread_count
            ) VALUES (
                NEW.company_id,
                v_chat_id,
                NEW.nome,
                NEW.telefone,
                v_message_text,
                v_timestamp,
                v_timestamp,
                0
            )
            ON CONFLICT (company_id, chat_id) 
            DO UPDATE SET
                last_message = EXCLUDED.last_message,
                last_message_time = EXCLUDED.last_message_time,
                updated_at = EXCLUDED.updated_at;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar erros de chat update
            NULL;
        END;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. MENSAGEM DE CONFIRMAÇÃO
SELECT 'FUNÇÃO DE PRODUÇÃO CORRIGIDA - AGORA VAI SALVAR NO CHAT!' as resultado;
