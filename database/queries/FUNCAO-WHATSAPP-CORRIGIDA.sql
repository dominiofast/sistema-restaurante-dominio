-- FUNCAO WHATSAPP COM NOMES CORRETOS DAS COLUNAS
-- Baseada na estrutura real das tabelas

-- Remover funcao antiga
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- Criar funcao corrigida
CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_item_record RECORD;
    v_adicional_record RECORD;
    v_itens_texto TEXT := '';
    v_item_id UUID;
BEGIN
    -- Buscar dados do pedido (NOMES CORRETOS)
    SELECT 
        p.*,
        c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = NEW.pedido_id;
    
    -- Buscar integracao WhatsApp (SEM is_active)
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    LIMIT 1;
    
    -- Se nao encontrar integracao, sair
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Montar texto dos itens com adicionais
    FOR v_item_record IN 
        SELECT 
            pi.id as item_id,
            pi.quantidade,
            pi.valor_total,
            p.name as produto_nome
        FROM pedido_itens pi
        JOIN produtos p ON pi.produto_id = p.id
        WHERE pi.pedido_id = NEW.pedido_id
        ORDER BY pi.created_at
    LOOP
        v_item_id := v_item_record.item_id;
        
        v_itens_texto := v_itens_texto || 
            '• ' || v_item_record.quantidade || 'x ' || v_item_record.produto_nome || 
            ' - R$ ' || REPLACE(v_item_record.valor_total::text, '.', ',') || E'\n';
        
        -- Buscar adicionais
        FOR v_adicional_record IN 
            SELECT a.name as adicional_nome
            FROM pedido_item_adicionais pia
            JOIN adicionais a ON pia.adicional_id = a.id
            WHERE pia.pedido_item_id = v_item_id
            ORDER BY a.name
        LOOP
            v_itens_texto := v_itens_texto || '  - ' || v_adicional_record.adicional_nome || E'\n';
        END LOOP;
        
        v_itens_texto := v_itens_texto || E'\n';
    END LOOP;
    
    -- Montar mensagem (NOMES CORRETOS: nome, numero_pedido, telefone)
    v_message_text := 
        '*PEDIDO CONFIRMADO*' || E'\n\n' ||
        '*Pedido n°* ' || v_pedido_record.numero_pedido || E'\n' ||
        '*Cliente:* ' || v_pedido_record.nome || E'\n' ||
        '*Telefone:* ' || v_pedido_record.telefone || E'\n' ||
        '*Tipo:* ' || 
        CASE 
            WHEN v_pedido_record.tipo = 'delivery' THEN 'Entrega'
            WHEN v_pedido_record.tipo = 'pickup' THEN 'Retirada'
            ELSE 'Balcao'
        END || E'\n\n' ||
        '*Itens do Pedido:*' || E'\n' || v_itens_texto ||
        E'\n*TOTAL:* R$ ' || REPLACE(v_pedido_record.total::text, '.', ',');
    
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

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_whatsapp_confirmation ON pedido_itens;
CREATE TRIGGER trigger_whatsapp_confirmation
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- Verificar se foi criado
SELECT 'Funcao WhatsApp corrigida e trigger criado!' as status;
