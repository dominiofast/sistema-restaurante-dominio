-- REMOVER TRIGGERS EXATOS QUE CAUSAM DUPLICACAO

-- DROPAR OS 2 TRIGGERS ESPECÍFICOS DE PEDIDO_ITENS
DROP TRIGGER IF EXISTS trigger_create_initial_item_status ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_whatsapp_final ON pedido_itens;

-- VERIFICAR SE REMOVEU OS TRIGGERS DE PEDIDO_ITENS
SELECT 
    COUNT(*) as triggers_pedido_itens,
    'DEVE SER 0' as verificacao
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND NOT t.tgisinternal;

-- DROPAR FUNCAO ANTIGA E RECRIAR LIMPA
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_itens_texto TEXT := '';
BEGIN
    -- Buscar pedido
    SELECT p.*, c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = NEW.pedido_id;
    
    -- Buscar WhatsApp
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    LIMIT 1;
    
    IF NOT FOUND THEN RETURN NEW; END IF;
    
    -- Montar lista de itens
    SELECT string_agg(
        '• ' || pi.quantidade || 'x ' || p.name || ' - R$ ' || REPLACE(pi.valor_total::text, '.', ','), 
        E'\n'
    ) INTO v_itens_texto
    FROM pedido_itens pi
    JOIN produtos p ON pi.produto_id = p.id
    WHERE pi.pedido_id = NEW.pedido_id;
    
    -- Montar mensagem
    v_message_text := 
        '*PEDIDO CONFIRMADO*' || E'\n\n' ||
        '*Pedido n°* ' || v_pedido_record.numero_pedido || E'\n' ||
        '*Cliente:* ' || v_pedido_record.nome || E'\n' ||
        '*Telefone:* ' || v_pedido_record.telefone || E'\n\n' ||
        '*Itens:*' || E'\n' || v_itens_texto || E'\n\n' ||
        '*TOTAL:* R$ ' || REPLACE(v_pedido_record.total::text, '.', ',');
    
    -- Enviar WhatsApp
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

-- CRIAR APENAS UM TRIGGER PARA WHATSAPP
CREATE TRIGGER trigger_whatsapp_unico_final
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- VERIFICAR RESULTADO FINAL
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    'TRIGGER FINAL' as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND NOT t.tgisinternal;
