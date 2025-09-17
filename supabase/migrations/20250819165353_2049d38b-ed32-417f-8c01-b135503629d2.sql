-- SOLUÇÃO SIMPLES: TRIGGER NO FINAL DOS ADICIONAIS, NÃO NO ITEM
-- Trocar de AFTER INSERT no pedido_itens para AFTER INSERT no pedido_item_adicionais

DROP TRIGGER IF EXISTS trigger_whatsapp_simples ON pedido_itens;
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- Função mais simples que executa APÓS os adicionais serem inseridos
CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_adicional()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_itens_texto TEXT := '';
    v_notification_exists BOOLEAN := FALSE;
    v_item_record RECORD;
    v_adicional_record RECORD;
    v_item_completo TEXT;
    v_adicionais_item TEXT;
BEGIN
    -- Verificar se já enviou notificação para este pedido
    SELECT EXISTS(
        SELECT 1 FROM ai_conversation_logs 
        WHERE message_type = 'notification_sent' 
        AND message_content LIKE '%FINAL ENVIADO%'
        AND message_content LIKE '%' || (
            SELECT numero_pedido FROM pedidos p 
            JOIN pedido_itens pi ON pi.pedido_id = p.id 
            WHERE pi.id = NEW.pedido_item_id
        ) || '%'
    ) INTO v_notification_exists;
    
    IF v_notification_exists THEN
        RETURN NEW;
    END IF;
    
    -- Buscar pedido através do item
    SELECT p.*, c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    JOIN pedido_itens pi ON pi.pedido_id = p.id
    WHERE pi.id = NEW.pedido_item_id;
    
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
        RETURN NEW; 
    END IF;
    
    -- Montar itens COM adicionais (agora todos já estão inseridos)
    v_itens_texto := '';
    FOR v_item_record IN 
        SELECT pi.*
        FROM pedido_itens pi
        WHERE pi.pedido_id = v_pedido_record.id
        AND pi.nome_produto NOT ILIKE '%taxa%'
        ORDER BY pi.created_at
    LOOP
        v_item_completo := '• ' || v_item_record.quantidade || 'x ' || v_item_record.nome_produto || ' - R$ ' || REPLACE(v_item_record.valor_total::text, '.', ',');
        
        v_adicionais_item := '';
        FOR v_adicional_record IN 
            SELECT nome_adicional, valor_unitario
            FROM pedido_item_adicionais
            WHERE pedido_item_id = v_item_record.id
            ORDER BY created_at
        LOOP
            IF v_adicionais_item != '' THEN
                v_adicionais_item := v_adicionais_item || E'\n';
            END IF;
            
            IF v_adicional_record.valor_unitario > 0 THEN
                v_adicionais_item := v_adicionais_item || '  ➤ ' || v_adicional_record.nome_adicional || 
                    ' (+R$ ' || REPLACE(v_adicional_record.valor_unitario::text, '.', ',') || ')';
            ELSE
                v_adicionais_item := v_adicionais_item || '  ➤ ' || v_adicional_record.nome_adicional;
            END IF;
        END LOOP;
        
        IF v_adicionais_item != '' THEN
            v_item_completo := v_item_completo || E'\n' || v_adicionais_item;
        END IF;
        
        IF v_itens_texto != '' THEN
            v_itens_texto := v_itens_texto || E'\n';
        END IF;
        v_itens_texto := v_itens_texto || v_item_completo;
    END LOOP;
    
    -- Montar mensagem
    v_message_text := 
        '🎉 *PEDIDO CONFIRMADO*' || E'\n\n' ||
        '📋 *Pedido:* ' || v_pedido_record.numero_pedido || E'\n' ||
        '👤 *Cliente:* ' || v_pedido_record.nome || E'\n' ||
        '📱 *Telefone:* ' || v_pedido_record.telefone || E'\n' ||
        '🚚 *Tipo:* ' || CASE WHEN v_pedido_record.tipo = 'delivery' THEN 'Entrega' ELSE 'Retirada' END || E'\n\n' ||
        '🛍 *Itens:*' || E'\n' || v_itens_texto || E'\n\n';
    
    IF v_pedido_record.tipo = 'delivery' AND v_pedido_record.endereco IS NOT NULL THEN
        v_message_text := v_message_text || '📍 *Endereço de Entrega:*' || E'\n' || v_pedido_record.endereco || E'\n\n';
    END IF;
    
    IF v_pedido_record.pagamento IS NOT NULL THEN
        v_message_text := v_message_text || '💳 *Forma de Pagamento:* ' || v_pedido_record.pagamento || E'\n\n';
    END IF;
    
    v_message_text := v_message_text || 
        '💰 *TOTAL: R$ ' || REPLACE(v_pedido_record.total::text, '.', ',') || '*' || E'\n\n' ||
        '✅ Seu pedido foi recebido e está sendo preparado!' || E'\n' ||
        '⏰ Em breve você receberá atualizações sobre o status.';
    
    -- Enviar WhatsApp
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
    
    -- Log final
    INSERT INTO ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        v_pedido_record.company_id,
        v_pedido_record.telefone,
        v_pedido_record.nome,
        'WHATSAPP FINAL ENVIADO: Pedido #' || v_pedido_record.numero_pedido || ' com adicionais',
        'notification_sent',
        now()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger APÓS adicionais serem inseridos
CREATE TRIGGER trigger_whatsapp_after_adicional
    AFTER INSERT ON pedido_item_adicionais
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_adicional();