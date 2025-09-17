-- CORRIGIR LÓGICA DO TRIGGER - O PROBLEMA É A CONDIÇÃO DE "PRIMEIRO ITEM"
-- Atualmente só envia WhatsApp no primeiro item, mas se houver múltiplos itens simultâneos, pode pular

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
    v_notification_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se já foi enviada notificação para este pedido
    SELECT EXISTS(
        SELECT 1 FROM ai_conversation_logs 
        WHERE message_type = 'notification_sent' 
        AND message_content LIKE '%Pedido #' || (SELECT numero_pedido FROM pedidos WHERE id = NEW.pedido_id) || '%'
    ) INTO v_notification_exists;
    
    -- Se já enviou, não enviar novamente
    IF v_notification_exists THEN
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            (SELECT company_id FROM pedidos WHERE id = NEW.pedido_id),
            (SELECT telefone FROM pedidos WHERE id = NEW.pedido_id),
            (SELECT nome FROM pedidos WHERE id = NEW.pedido_id),
            'WHATSAPP JÁ ENVIADO: Pedido #' || (SELECT numero_pedido FROM pedidos WHERE id = NEW.pedido_id) || ' - notificação já foi enviada',
            'notification_skipped',
            now()
        );
        RETURN NEW;
    END IF;
    
    -- Buscar pedido
    SELECT p.*, c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = NEW.pedido_id;
    
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Buscar WhatsApp (usar 'primary')
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    AND purpose = 'primary'
    LIMIT 1;
    
    IF NOT FOUND THEN 
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            v_pedido_record.company_id,
            v_pedido_record.telefone,
            v_pedido_record.nome,
            'WHATSAPP ERROR: Integração não encontrada para company_id ' || v_pedido_record.company_id,
            'notification_error',
            now()
        );
        RETURN NEW; 
    END IF;
    
    -- Montar lista de itens
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
    
    -- Enviar WhatsApp via Edge Function
    SELECT content INTO v_api_response
    FROM http((
        'POST',
        'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/send-whatsapp-message',
        ARRAY[
            http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg'),
            http_header('Content-Type', 'application/json')
        ],
        'application/json',
        json_build_object(
            'phone', v_pedido_record.telefone,
            'message', v_message_text,
            'integration', json_build_object(
                'host', v_whatsapp_integration.host,
                'token', v_whatsapp_integration.token,
                'instance_key', v_whatsapp_integration.instance_key
            )
        )::text
    ));
    
    -- Log da notificação enviada
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        v_pedido_record.company_id,
        v_pedido_record.telefone,
        v_pedido_record.nome,
        'WHATSAPP ENVIADO: Pedido #' || v_pedido_record.numero_pedido || ' confirmado - ' || v_api_response,
        'notification_sent',
        now()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            v_pedido_record.company_id,
            v_pedido_record.telefone,
            v_pedido_record.nome,
            'WHATSAPP ERROR: ' || SQLERRM,
            'notification_error',
            now()
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