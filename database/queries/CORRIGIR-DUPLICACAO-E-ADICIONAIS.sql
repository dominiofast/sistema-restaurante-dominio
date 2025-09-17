-- CORRIGIR DUPLICACAO E ADICIONAIS
-- 1. Remover TODOS os triggers duplicados
-- 2. Corrigir query dos adicionais

-- LIMPAR TODOS OS TRIGGERS DE WHATSAPP
DROP TRIGGER IF EXISTS trigger_whatsapp_confirmation ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_confirmacao_limpa_final ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_whatsapp_notification_after_items ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_confirmacao_nova ON pedido_itens;
DROP TRIGGER IF EXISTS send_single_clean_confirmation ON pedidos;
DROP TRIGGER IF EXISTS send_single_clean_confirmation ON pedido_itens;

-- REMOVER FUNCAO ANTIGA
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- CRIAR FUNCAO UNICA COM ADICIONAIS CORRIGIDOS
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
    v_adicionais_item TEXT := '';
BEGIN
    -- Buscar dados do pedido
    SELECT 
        p.*,
        c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = NEW.pedido_id;
    
    -- Buscar integracao WhatsApp
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    LIMIT 1;
    
    IF NOT FOUND THEN RETURN NEW; END IF;
    
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
        v_adicionais_item := '';
        
        -- Item principal
        v_itens_texto := v_itens_texto || 
            '• ' || v_item_record.quantidade || 'x ' || v_item_record.produto_nome || 
            ' - R$ ' || REPLACE(v_item_record.valor_total::text, '.', ',') || E'\n';
        
        -- Buscar adicionais deste item
        FOR v_adicional_record IN 
            SELECT a.name as adicional_nome
            FROM pedido_item_adicionais pia
            JOIN adicionais a ON pia.adicional_id = a.id
            WHERE pia.pedido_item_id = v_item_id
            ORDER BY a.name
        LOOP
            v_adicionais_item := v_adicionais_item || '  - ' || v_adicional_record.adicional_nome || E'\n';
        END LOOP;
        
        -- Adicionar adicionais ao texto se existirem
        IF v_adicionais_item != '' THEN
            v_itens_texto := v_itens_texto || v_adicionais_item;
        END IF;
        
        v_itens_texto := v_itens_texto || E'\n';
    END LOOP;
    
    -- Montar mensagem
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
        '*TOTAL:* R$ ' || REPLACE(v_pedido_record.total::text, '.', ',');
    
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

-- CRIAR APENAS UM TRIGGER UNICO
CREATE TRIGGER trigger_whatsapp_unico
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- Verificar que so tem 1 trigger
SELECT 
    COUNT(*) as total_triggers,
    'DEVE SER 1' as verificacao
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND NOT t.tgisinternal;
