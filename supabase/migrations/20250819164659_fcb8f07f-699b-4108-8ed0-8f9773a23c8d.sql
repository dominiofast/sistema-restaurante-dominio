-- CORRIGIR PROBLEMA DE TIMING - AGUARDAR ADICIONAIS SEREM INSERIDOS
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
    v_item_record RECORD;
    v_adicional_record RECORD;
    v_item_completo TEXT;
    v_adicionais_item TEXT;
    v_retry_count INTEGER := 0;
    v_adicional_count INTEGER := 0;
BEGIN
    -- CORRIGIR: Verificar se já foi enviada notificação para este PEDIDO ESPECÍFICO
    SELECT EXISTS(
        SELECT 1 FROM ai_conversation_logs 
        WHERE message_type = 'notification_sent' 
        AND message_content LIKE '%COM ADICIONAIS%'
        AND message_content LIKE '%pedido_id=' || NEW.pedido_id || '%'
    ) INTO v_notification_exists;
    
    -- Se já enviou, não enviar novamente
    IF v_notification_exists THEN
        RETURN NEW;
    END IF;
    
    -- AGUARDAR ADICIONAIS SEREM INSERIDOS (retry até 3 vezes com delay)
    LOOP
        SELECT COUNT(*) INTO v_adicional_count
        FROM pedido_item_adicionais pia
        JOIN pedido_itens pi ON pi.id = pia.pedido_item_id  
        WHERE pi.pedido_id = NEW.pedido_id;
        
        -- Se tem adicionais OU já tentou 3 vezes, continuar
        EXIT WHEN v_adicional_count > 0 OR v_retry_count >= 3;
        
        -- Aguardar 500ms antes de tentar novamente
        PERFORM pg_sleep(0.5);
        v_retry_count := v_retry_count + 1;
    END LOOP;
    
    -- Log para debug
    INSERT INTO ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        (SELECT company_id FROM pedidos WHERE id = NEW.pedido_id),
        (SELECT telefone FROM pedidos WHERE id = NEW.pedido_id),
        (SELECT nome FROM pedidos WHERE id = NEW.pedido_id),
        'WHATSAPP DEBUG: Pedido ID=' || NEW.pedido_id || ' | Adicionais encontrados: ' || v_adicional_count || ' | Tentativas: ' || v_retry_count,
        'debug_timing',
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
        RETURN NEW; 
    END IF;
    
    -- Montar lista de itens COM ADICIONAIS E OBSERVAÇÕES
    v_itens_texto := '';
    FOR v_item_record IN 
        SELECT pi.*
        FROM pedido_itens pi
        WHERE pi.pedido_id = NEW.pedido_id
        AND pi.nome_produto NOT ILIKE '%taxa%'
        ORDER BY pi.created_at
    LOOP
        -- Iniciar item
        v_item_completo := '• ' || v_item_record.quantidade || 'x ' || v_item_record.nome_produto || ' - R$ ' || REPLACE(v_item_record.valor_total::text, '.', ',');
        
        -- Buscar adicionais deste item
        v_adicionais_item := '';
        FOR v_adicional_record IN 
            SELECT nome_adicional, categoria_nome, quantidade, valor_unitario
            FROM pedido_item_adicionais
            WHERE pedido_item_id = v_item_record.id
            ORDER BY created_at
        LOOP
            IF v_adicionais_item != '' THEN
                v_adicionais_item := v_adicionais_item || E'\n';
            END IF;
            
            -- Formatar adicional
            IF v_adicional_record.valor_unitario > 0 THEN
                v_adicionais_item := v_adicionais_item || '  ➤ ' || v_adicional_record.nome_adicional || 
                    ' (+R$ ' || REPLACE(v_adicional_record.valor_unitario::text, '.', ',') || ')';
            ELSE
                v_adicionais_item := v_adicionais_item || '  ➤ ' || v_adicional_record.nome_adicional;
            END IF;
        END LOOP;
        
        -- Adicionar adicionais ao item se houver
        IF v_adicionais_item != '' THEN
            v_item_completo := v_item_completo || E'\n' || v_adicionais_item;
        END IF;
        
        -- Adicionar observações do item se houver
        IF v_item_record.observacoes IS NOT NULL AND TRIM(v_item_record.observacoes) != '' THEN
            v_item_completo := v_item_completo || E'\n' || '  💬 ' || v_item_record.observacoes;
        END IF;
        
        -- Adicionar ao texto final
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
    
    -- Adicionar endereço se for delivery
    IF v_pedido_record.tipo = 'delivery' AND v_pedido_record.endereco IS NOT NULL THEN
        v_message_text := v_message_text || '📍 *Endereço de Entrega:*' || E'\n' || v_pedido_record.endereco || E'\n\n';
    END IF;
    
    -- Adicionar forma de pagamento
    IF v_pedido_record.pagamento IS NOT NULL THEN
        v_message_text := v_message_text || '💳 *Forma de Pagamento:* ' || v_pedido_record.pagamento || E'\n\n';
    END IF;
    
    -- Adicionar observações do pedido
    IF v_pedido_record.observacoes IS NOT NULL AND TRIM(v_pedido_record.observacoes) != '' THEN
        v_message_text := v_message_text || '📝 *Observações do Pedido:*' || E'\n' || v_pedido_record.observacoes || E'\n\n';
    END IF;
    
    -- Adicionar total
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
    
    -- Log da notificação enviada
    INSERT INTO ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        v_pedido_record.company_id,
        v_pedido_record.telefone,
        v_pedido_record.nome,
        'WHATSAPP ENVIADO COM ADICIONAIS: Pedido #' || v_pedido_record.numero_pedido || ' (pedido_id=' || NEW.pedido_id || ') | Adicionais: ' || v_adicional_count || ' - ' || v_api_response,
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
            (SELECT company_id FROM pedidos WHERE id = NEW.pedido_id),
            (SELECT telefone FROM pedidos WHERE id = NEW.pedido_id),
            (SELECT nome FROM pedidos WHERE id = NEW.pedido_id),
            'WHATSAPP ERROR: ' || SQLERRM,
            'notification_error',
            now()
        );
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
CREATE TRIGGER trigger_whatsapp_simples
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();