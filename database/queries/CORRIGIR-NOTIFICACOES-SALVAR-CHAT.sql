-- CORRIGIR NOTIFICAÇÕES PARA APARECER NO CHAT
-- Execute no SQL Editor do Supabase

-- 1. ATUALIZAR FUNÇÃO DE NOTIFICAÇÃO DE PRODUÇÃO
CREATE OR REPLACE FUNCTION notify_production_status()
RETURNS TRIGGER AS $$
DECLARE
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_company_name TEXT;
    v_message_id TEXT;
    v_timestamp TIMESTAMP;
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
        
        -- 1. SALVAR MENSAGEM NO BANCO PRIMEIRO
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
            NEW.telefone,
            NEW.nome,
            NEW.telefone,
            v_message_id,
            v_message_text,
            'text',
            true,  -- É do estabelecimento
            'sent',
            v_timestamp
        );
        
        -- 2. ATUALIZAR/CRIAR CHAT
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
            NEW.telefone,
            NEW.nome,
            NEW.telefone,
            v_message_text,
            v_timestamp,
            v_timestamp,
            0  -- Mensagem do estabelecimento não conta como não lida
        )
        ON CONFLICT (company_id, chat_id) 
        DO UPDATE SET
            last_message = EXCLUDED.last_message,
            last_message_time = EXCLUDED.last_message_time,
            updated_at = EXCLUDED.updated_at;
        
        -- 3. ENVIAR VIA WHATSAPP API
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
        EXCEPTION WHEN OTHERS THEN
            v_api_response := 'Erro: ' || SQLERRM;
        END;
        
        -- Log da tentativa de envio
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'PRODUÇÃO ENVIADA: ' || v_message_text || ' | API Response: ' || COALESCE(v_api_response, 'N/A'),
            'production_notification_sent', now()
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. ATUALIZAR FUNÇÃO DE NOTIFICAÇÃO DE PRONTO
CREATE OR REPLACE FUNCTION notify_ready_status()
RETURNS TRIGGER AS $$
DECLARE
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_company_name TEXT;
    v_pedido_itens TEXT := '';
    v_item RECORD;
    v_message_id TEXT;
    v_timestamp TIMESTAMP;
BEGIN
    -- Verificar se mudou de "producao" para "pronto"
    IF OLD.status = 'producao' AND NEW.status = 'pronto' THEN
        
        -- Log da mudança
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'PRONTO: Status mudou de producao -> pronto para pedido #' || COALESCE(NEW.numero_pedido::text, NEW.id::text) || ' | Tipo: ' || COALESCE(NEW.tipo, 'N/A'),
            'ready_status_change', now()
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
                'ready_notification_error', now()
            );
            RETURN NEW; 
        END IF;
        
        -- Buscar nome da empresa
        SELECT name INTO v_company_name
        FROM companies WHERE id = NEW.company_id;
        
        -- Buscar itens do pedido
        FOR v_item IN 
            SELECT nome_produto, quantidade
            FROM pedido_itens 
            WHERE pedido_id = NEW.id
            ORDER BY created_at
        LOOP
            v_pedido_itens := v_pedido_itens || '• ' || v_item.quantidade || 'x ' || v_item.nome_produto || E'\n';
        END LOOP;
        
        -- Montar mensagem baseada no tipo do pedido
        IF NEW.tipo = 'entrega' THEN
            v_message_text := 
                '🎉 *SEU PEDIDO ESTÁ PRONTO PARA ENTREGA!* 🚚' || E'\n\n' ||
                '📋 *Pedido n°* ' || COALESCE(NEW.numero_pedido::text, NEW.id::text) || E'\n' ||
                '👤 *Cliente:* ' || NEW.nome || E'\n' ||
                '🏠 *Endereço:* ' || COALESCE(NEW.endereco, 'Não informado') || E'\n\n' ||
                CASE WHEN v_pedido_itens != '' THEN 
                    '📝 *Itens:*' || E'\n' || v_pedido_itens || E'\n'
                ELSE '' END ||
                '🚚 Nosso entregador está a caminho!' || E'\n' ||
                '📱 Acompanhe pelo telefone ou aguarde o contato.' || E'\n\n' ||
                '🏪 *' || COALESCE(v_company_name, 'Estabelecimento') || '*' || E'\n' ||
                '😋 Obrigado pela preferência!';
        ELSE
            v_message_text := 
                '🎉 *SEU PEDIDO ESTÁ PRONTO PARA RETIRADA!* 🏪' || E'\n\n' ||
                '📋 *Pedido n°* ' || COALESCE(NEW.numero_pedido::text, NEW.id::text) || E'\n' ||
                '👤 *Cliente:* ' || NEW.nome || E'\n\n' ||
                CASE WHEN v_pedido_itens != '' THEN 
                    '📝 *Itens:*' || E'\n' || v_pedido_itens || E'\n'
                ELSE '' END ||
                '🏪 Pode vir buscar no balcão!' || E'\n' ||
                '⏰ Estamos te esperando.' || E'\n\n' ||
                '🏪 *' || COALESCE(v_company_name, 'Estabelecimento') || '*' || E'\n' ||
                '😋 Obrigado pela preferência!';
        END IF;
        
        -- Gerar IDs para a mensagem
        v_message_id := 'notify_ready_' || NEW.id || '_' || extract(epoch from now()) || '_' || (random() * 1000)::int;
        v_timestamp := now();
        
        -- 1. SALVAR MENSAGEM NO BANCO PRIMEIRO
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
            NEW.telefone,
            NEW.nome,
            NEW.telefone,
            v_message_id,
            v_message_text,
            'text',
            true,  -- É do estabelecimento
            'sent',
            v_timestamp
        );
        
        -- 2. ATUALIZAR/CRIAR CHAT
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
            NEW.telefone,
            NEW.nome,
            NEW.telefone,
            v_message_text,
            v_timestamp,
            v_timestamp,
            0  -- Mensagem do estabelecimento não conta como não lida
        )
        ON CONFLICT (company_id, chat_id) 
        DO UPDATE SET
            last_message = EXCLUDED.last_message,
            last_message_time = EXCLUDED.last_message_time,
            updated_at = EXCLUDED.updated_at;
        
        -- 3. ENVIAR VIA WHATSAPP API
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
        EXCEPTION WHEN OTHERS THEN
            v_api_response := 'Erro: ' || SQLERRM;
        END;
        
        -- Log da tentativa de envio
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'PRONTO ENVIADO: ' || v_message_text || ' | API Response: ' || COALESCE(v_api_response, 'N/A'),
            'ready_notification_sent', now()
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CONFIRMAR ATUALIZAÇÃO
SELECT 'FUNÇÕES ATUALIZADAS! Agora notificações aparecerão no chat.' as resultado;
