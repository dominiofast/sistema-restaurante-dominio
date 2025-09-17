-- REMOVER TRIGGERS ANTIGOS
DROP TRIGGER IF EXISTS trigger_whatsapp_notification_after_items ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_confirmacao_limpa_final ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_confirmacao_nova ON pedido_itens;

-- REMOVER FUNCAO ANTIGA
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- CRIAR NOVA FUNCAO COM ADICIONAIS
CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_item_record RECORD;
    v_adicional_record RECORD;
    v_taxa_entrega DECIMAL := 0;
    v_itens_texto TEXT := '';
    v_item_id UUID;
BEGIN
    SELECT p.*, c.name as company_name, c.phone as company_phone, COALESCE(dm.delivery_fee, 0) as delivery_fee
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    LEFT JOIN delivery_methods dm ON p.company_id = dm.company_id
    WHERE p.id = NEW.pedido_id;
    
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id AND is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN RETURN NEW; END IF;
    
    IF v_pedido_record.tipo_pedido = 'delivery' THEN
        v_taxa_entrega := v_pedido_record.delivery_fee;
    END IF;
    
    FOR v_item_record IN 
        SELECT pi.id as item_id, pi.quantidade, pi.valor_total, p.name as produto_nome
        FROM pedido_itens pi
        JOIN produtos p ON pi.produto_id = p.id
        WHERE pi.pedido_id = NEW.pedido_id
        ORDER BY pi.created_at
    LOOP
        v_item_id := v_item_record.item_id;
        
        v_itens_texto := v_itens_texto || 
            '• ' || v_item_record.quantidade || 'x ' || v_item_record.produto_nome || 
            ' - R$ ' || REPLACE(v_item_record.valor_total::text, '.', ',') || E'\n';
        
        FOR v_adicional_record IN 
            SELECT a.name as adicional_nome, ac.name as categoria_nome
            FROM pedido_item_adicionais pia
            JOIN adicionais a ON pia.adicional_id = a.id
            JOIN adicional_categories ac ON a.category_id = ac.id
            WHERE pia.pedido_item_id = v_item_id
            ORDER BY ac.name, a.name
        LOOP
            v_itens_texto := v_itens_texto || '  - ' || v_adicional_record.adicional_nome || E'\n';
        END LOOP;
        
        v_itens_texto := v_itens_texto || E'\n';
    END LOOP;
    
    v_message_text := 
        '*PEDIDO CONFIRMADO*' || E'\n\n' ||
        '*Pedido n°* ' || v_pedido_record.numero_pedido || E'\n' ||
        '*Cliente:* ' || v_pedido_record.nome_cliente || E'\n' ||
        '*Telefone:* ' || v_pedido_record.telefone || E'\n' ||
        '*Tipo:* ' || 
        CASE 
            WHEN v_pedido_record.tipo_pedido = 'delivery' THEN 'Entrega'
            WHEN v_pedido_record.tipo_pedido = 'pickup' THEN 'Retirada'
            ELSE 'Balcao'
        END || E'\n\n' ||
        '*Itens do Pedido:*' || E'\n' || v_itens_texto ||
        E'\n*Subtotal:* R$ ' || REPLACE(v_pedido_record.valor_total::text, '.', ',');
    
    IF v_taxa_entrega > 0 THEN
        v_message_text := v_message_text || E'\n*Taxa Entrega:* R$ ' || REPLACE(v_taxa_entrega::text, '.', ',');
    END IF;
    
    v_message_text := v_message_text || E'\n*TOTAL:* R$ ' || REPLACE((v_pedido_record.valor_total + v_taxa_entrega)::text, '.', ',');
    
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
                'to', v_pedido_record.telefone,
                'text', v_message_text
            )
        )::text
    ));
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CRIAR TRIGGER
CREATE TRIGGER trigger_confirmacao_limpa_final
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();
