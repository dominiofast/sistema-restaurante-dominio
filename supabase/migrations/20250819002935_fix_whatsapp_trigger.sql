-- Depêndencia para chamada HTTP a partir do Postgres
CREATE EXTENSION IF NOT EXISTS http;

-- FUNÇÃO DE TRIGGER OTIMIZADA PARA NOTIFICAÇÕES WHATSAPP
-- Implementa controle de duplicação robusto e fallback para queue assíncrona

-- Primeiro, remover triggers e funções antigas
DROP TRIGGER IF EXISTS trigger_whatsapp_funcionando ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_whatsapp_primeiro_item ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_whatsapp_notification ON pedido_itens;
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- Criar função otimizada com fallback para queue assíncrona
CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_itens_texto TEXT := '';
    v_total_itens INTEGER;
    v_notification_sent BOOLEAN DEFAULT FALSE;
    v_error_message TEXT;
    v_phone_clean TEXT;
BEGIN
    -- Log de execução do trigger
    RAISE NOTICE '[WHATSAPP_TRIGGER] Executando para pedido_id: %', NEW.pedido_id;
    
    -- Controle de duplicação: só executa no primeiro item do pedido
    SELECT COUNT(*) INTO v_total_itens
    FROM pedido_itens 
    WHERE pedido_id = NEW.pedido_id;
    
    IF v_total_itens > 1 THEN
        RAISE NOTICE '[WHATSAPP_TRIGGER] Pulando envio - já existem % itens no pedido', v_total_itens;
        RETURN NEW;
    END IF;
    
    -- Buscar dados do pedido com informações da empresa
    SELECT p.*, c.name as company_name, c.id as company_uuid
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = NEW.pedido_id;
    
    IF NOT FOUND THEN
        RAISE WARNING '[WHATSAPP_TRIGGER] Pedido não encontrado: %', NEW.pedido_id;
        RETURN NEW;
    END IF;
    
    -- Validar se o telefone existe e é válido
    IF v_pedido_record.telefone IS NULL OR LENGTH(TRIM(v_pedido_record.telefone)) < 10 THEN
        RAISE WARNING '[WHATSAPP_TRIGGER] Telefone inválido para pedido %: %', NEW.pedido_id, v_pedido_record.telefone;
        
        -- Log do erro
        INSERT INTO notification_logs (pedido_id, type, status, details, created_at)
        VALUES (NEW.pedido_id, 'whatsapp_trigger', 'failed', 
                jsonb_build_object(
                    'error', 'invalid_phone',
                    'phone', v_pedido_record.telefone,
                    'trigger_executed', true
                ), NOW())
        ON CONFLICT DO NOTHING;
        
        RETURN NEW;
    END IF;
    
    -- Limpar telefone (remover caracteres especiais)
    v_phone_clean := REGEXP_REPLACE(v_pedido_record.telefone, '[^0-9]', '', 'g');
    
    -- Buscar configuração WhatsApp da empresa
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    AND active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE WARNING '[WHATSAPP_TRIGGER] Integração WhatsApp não encontrada ou inativa para empresa: %', v_pedido_record.company_id;
        
        -- Log do erro
        INSERT INTO notification_logs (pedido_id, type, status, details, created_at)
        VALUES (NEW.pedido_id, 'whatsapp_trigger', 'failed', 
                jsonb_build_object(
                    'error', 'integration_not_found',
                    'company_id', v_pedido_record.company_id,
                    'trigger_executed', true
                ), NOW())
        ON CONFLICT DO NOTHING;
        
        RETURN NEW;
    END IF;
    
    -- Montar lista de itens do pedido
    SELECT string_agg(
        '• ' || pi.quantidade || 'x ' || COALESCE(p.name, 'Produto') || 
        CASE 
            WHEN pi.valor_total > 0 THEN ' - R$ ' || REPLACE(pi.valor_total::text, '.', ',')
            ELSE ''
        END, 
        E'\n'
    ) INTO v_itens_texto
    FROM pedido_itens pi
    LEFT JOIN produtos p ON pi.produto_id = p.id
    WHERE pi.pedido_id = NEW.pedido_id
    AND NOT (COALESCE(pi.nome_produto, p.name, '') ILIKE '%taxa%');
    
    -- Montar mensagem de confirmação
    v_message_text := 
        '🎉 *PEDIDO CONFIRMADO*' || E'\n\n' ||
        '📋 *Pedido:* ' || COALESCE(v_pedido_record.numero_pedido::text, 'N/A') || E'\n' ||
        '👤 *Cliente:* ' || COALESCE(v_pedido_record.nome, 'N/A') || E'\n' ||
        '📱 *Telefone:* ' || v_phone_clean || E'\n\n' ||
        '🛍️ *Itens:*' || E'\n' || COALESCE(v_itens_texto, 'Nenhum item encontrado') || E'\n\n' ||
        '💰 *TOTAL: R$ ' || REPLACE(COALESCE(v_pedido_record.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
        '✅ Seu pedido foi recebido e está sendo preparado!' || E'\n' ||
        '⏰ Em breve você receberá atualizações sobre o status.';
    
    -- Tentar enviar WhatsApp
    BEGIN
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
                    'to', v_phone_clean,
                    'text', v_message_text
                )
            )::text
        ));
        
        -- Verificar se a resposta indica sucesso
        IF v_api_response IS NOT NULL AND v_api_response NOT LIKE '%error%' THEN
            v_notification_sent := TRUE;
            RAISE NOTICE '[WHATSAPP_TRIGGER] Notificação enviada com sucesso para %', v_phone_clean;
        ELSE
            v_notification_sent := FALSE;
            v_error_message := 'API response: ' || COALESCE(v_api_response, 'null');
            RAISE WARNING '[WHATSAPP_TRIGGER] Falha no envio - Response: %', v_api_response;
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            v_notification_sent := FALSE;
            v_error_message := SQLERRM;
            RAISE WARNING '[WHATSAPP_TRIGGER] Erro na API WhatsApp: %', SQLERRM;
    END;
    
    -- Se falhou, adicionar à queue assíncrona (fallback)
    IF NOT v_notification_sent THEN
        INSERT INTO notification_queue (pedido_id, type, status, payload, created_at)
        VALUES (
            NEW.pedido_id, 
            'whatsapp_order_confirmation', 
            'pending',
            jsonb_build_object(
                'phone', v_phone_clean,
                'message', v_message_text,
                'company_id', v_pedido_record.company_id,
                'trigger_failed', true,
                'error', v_error_message
            ),
            NOW()
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '[WHATSAPP_TRIGGER] Adicionado à queue assíncrona devido à falha';
    END IF;
    
    -- Log detalhado da operação
    INSERT INTO notification_logs (pedido_id, type, status, details, created_at)
    VALUES (
        NEW.pedido_id, 
        'whatsapp_trigger', 
        CASE WHEN v_notification_sent THEN 'success' ELSE 'failed' END,
        jsonb_build_object(
            'trigger_executed', true,
            'sent', v_notification_sent,
            'phone', v_phone_clean,
            'company_id', v_pedido_record.company_id,
            'api_response', v_api_response,
            'error', v_error_message,
            'fallback_queued', NOT v_notification_sent
        ),
        NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log de erro crítico
        RAISE WARNING '[WHATSAPP_TRIGGER] Erro crítico no trigger: %', SQLERRM;
        
        -- Tentar adicionar à queue mesmo com erro crítico
        BEGIN
            INSERT INTO notification_queue (pedido_id, type, status, payload, created_at)
            VALUES (
                NEW.pedido_id, 
                'whatsapp_order_confirmation', 
                'pending',
                jsonb_build_object(
                    'trigger_error', SQLERRM,
                    'company_id', COALESCE(v_pedido_record.company_id, 'unknown')
                ),
                NOW()
            )
            ON CONFLICT DO NOTHING;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING '[WHATSAPP_TRIGGER] Falha crítica - não foi possível adicionar à queue: %', SQLERRM;
        END;
        
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger otimizado
CREATE TRIGGER trigger_whatsapp_notification
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();