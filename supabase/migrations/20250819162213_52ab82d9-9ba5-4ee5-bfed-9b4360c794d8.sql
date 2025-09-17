-- PROBLEMA IDENTIFICADO: A função só envia WhatsApp no PRIMEIRO item
-- Mas se o pedido tem múltiplos itens, ela não enviará
-- SOLUÇÃO: Aguardar um pouco e depois verificar se é realmente o último item

DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_itens_texto TEXT := '';
    v_total_itens INTEGER;
BEGIN
    -- AGUARDAR 3 SEGUNDOS para todos os itens serem inseridos
    PERFORM pg_sleep(3);
    
    -- Contar quantos itens tem no pedido AGORA (após a espera)
    SELECT COUNT(*) INTO v_total_itens
    FROM pedido_itens 
    WHERE pedido_id = NEW.pedido_id;
    
    -- Log para debug
    INSERT INTO ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        (SELECT company_id FROM pedidos WHERE id = NEW.pedido_id),
        'WHATSAPP-DEBUG',
        'SYSTEM',
        'WHATSAPP DEBUG: Pedido ' || NEW.pedido_id || ' tem ' || v_total_itens || ' itens. Trigger executando para item: ' || NEW.nome_produto,
        'notification_debug',
        now()
    );
    
    -- Buscar pedido
    SELECT p.*, c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = NEW.pedido_id;
    
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Buscar WhatsApp
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    AND purpose = 'primary'
    LIMIT 1;
    
    IF NOT FOUND THEN 
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            v_pedido_record.company_id, v_pedido_record.telefone, v_pedido_record.nome,
            'WHATSAPP ERRO: Integração não encontrada para company_id ' || v_pedido_record.company_id,
            'notification_error', now()
        );
        RETURN NEW; 
    END IF;
    
    -- Montar lista de itens (excluir taxas)
    SELECT string_agg(
        '• ' || pi.quantidade || 'x ' || pi.nome_produto || ' - R$ ' || REPLACE(pi.valor_total::text, '.', ','), 
        E'\n'
    ) INTO v_itens_texto
    FROM pedido_itens pi
    WHERE pi.pedido_id = NEW.pedido_id
    AND pi.nome_produto NOT ILIKE '%taxa%';
    
    -- Montar mensagem com formato solicitado
    v_message_text := 
        '🎉 *PEDIDO CONFIRMADO*' || E'\n\n' ||
        '📋 *Pedido:* ' || v_pedido_record.numero_pedido || E'\n' ||
        '👤 *Cliente:* ' || v_pedido_record.nome || E'\n' ||
        '📱 *Telefone:* ' || v_pedido_record.telefone || E'\n' ||
        '🚚 *Tipo:* ' || CASE WHEN v_pedido_record.tipo = 'delivery' THEN 'Entrega' ELSE 'Retirada' END || E'\n\n' ||
        '🛍 *Itens:*' || E'\n' || v_itens_texto || E'\n\n';
    
    -- Adicionar endereço se for delivery
    IF v_pedido_record.tipo = 'delivery' AND v_pedido_record.endereco IS NOT NULL THEN
        v_message_text := v_message_text || '📍 *Endereço de Entrega:*' || E'\n' || v_pedido_record.endereco || E'\n\n';
    END IF;
    
    -- Adicionar forma de pagamento se disponível
    IF v_pedido_record.pagamento IS NOT NULL THEN
        v_message_text := v_message_text || '💳 *Forma de Pagamento:* ' || v_pedido_record.pagamento || E'\n\n';
    END IF;
    
    -- Adicionar total
    v_message_text := v_message_text || 
        '💰 *TOTAL: R$ ' || REPLACE(v_pedido_record.total::text, '.', ',') || '*' || E'\n\n' ||
        '✅ Seu pedido foi recebido e está sendo preparado!' || E'\n' ||
        '⏰ Em breve você receberá atualizações sobre o status.';
    
    -- Enviar WhatsApp
    BEGIN
        SELECT content INTO v_api_response
        FROM http((
            'POST',
            'https://' || v_whatsapp_integration.host || '/rest/sendMessage/' || v_whatsapp_integration.instance_key || '/text',
            ARRAY[
                http_header('Authorization', 'Bearer ' || v_whatsapp_integration.token),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'messageData', json_build_object(
                    'to', v_pedido_record.telefone,
                    'text', v_message_text
                )
            )::text
        ));
        
        -- Log da notificação enviada
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            v_pedido_record.company_id, v_pedido_record.telefone, v_pedido_record.nome,
            'WHATSAPP ENVIADO: Pedido #' || v_pedido_record.numero_pedido || ' confirmado. Resposta API: ' || COALESCE(v_api_response, 'sem resposta'),
            'notification_sent', now()
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Log de erro
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                v_pedido_record.company_id, v_pedido_record.telefone, v_pedido_record.nome,
                'WHATSAPP ERRO: Falha ao enviar notificação - ' || SQLERRM,
                'notification_error', now()
            );
    END;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log de erro geral
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            COALESCE((SELECT company_id FROM pedidos WHERE id = NEW.pedido_id), '00000000-0000-0000-0000-000000000000'::uuid),
            'ERROR', 'SYSTEM',
            'WHATSAPP TRIGGER ERRO GERAL: ' || SQLERRM,
            'notification_error', now()
        );
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS trigger_whatsapp_simples ON pedido_itens;
CREATE TRIGGER trigger_whatsapp_simples
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();