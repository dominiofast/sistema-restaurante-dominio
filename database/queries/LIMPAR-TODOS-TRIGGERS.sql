-- LIMPAR ABSOLUTAMENTE TODOS OS TRIGGERS
-- Script mais agressivo para remover duplicatas

-- VER QUAIS TRIGGERS EXISTEM PRIMEIRO
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    'TRIGGER ENCONTRADO' as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE (c.relname = 'pedido_itens' OR c.relname = 'pedidos')
AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- DROPAR TODOS OS TRIGGERS UM POR UM (NAMES ESPECÍFICOS)
DROP TRIGGER IF EXISTS trigger_whatsapp_unico ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_whatsapp_confirmation ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_confirmacao_limpa_final ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_whatsapp_notification_after_items ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_confirmacao_nova ON pedido_itens;
DROP TRIGGER IF EXISTS send_single_clean_confirmation ON pedidos;
DROP TRIGGER IF EXISTS send_single_clean_confirmation ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_notify_production ON pedidos;

-- DROPAR TODAS AS FUNCOES RELACIONADAS
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;
DROP FUNCTION IF EXISTS notify_production_status() CASCADE;
DROP FUNCTION IF EXISTS enviar_confirmacao_formatada() CASCADE;
DROP FUNCTION IF EXISTS enviar_confirmacao_simples() CASCADE;

-- VERIFICAR SE LIMPOU TUDO
SELECT 
    COUNT(*) as triggers_restantes,
    'DEVE SER 0' as verificacao
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE (c.relname = 'pedido_itens' OR c.relname = 'pedidos')
AND NOT t.tgisinternal;

-- CRIAR NOVA FUNCAO LIMPA
CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_itens_texto TEXT := '';
BEGIN
    SELECT p.*, c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = NEW.pedido_id;
    
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    LIMIT 1;
    
    IF NOT FOUND THEN RETURN NEW; END IF;
    
    -- Simplificar: apenas itens principais por enquanto
    SELECT string_agg(
        '• ' || pi.quantidade || 'x ' || p.name || ' - R$ ' || REPLACE(pi.valor_total::text, '.', ','), 
        E'\n'
    ) INTO v_itens_texto
    FROM pedido_itens pi
    JOIN produtos p ON pi.produto_id = p.id
    WHERE pi.pedido_id = NEW.pedido_id;
    
    v_message_text := 
        '*PEDIDO CONFIRMADO*' || E'\n\n' ||
        '*Pedido n°* ' || v_pedido_record.numero_pedido || E'\n' ||
        '*Cliente:* ' || v_pedido_record.nome || E'\n' ||
        '*Telefone:* ' || v_pedido_record.telefone || E'\n\n' ||
        '*Itens:*' || E'\n' || v_itens_texto || E'\n\n' ||
        '*TOTAL:* R$ ' || REPLACE(v_pedido_record.total::text, '.', ',');
    
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

-- CRIAR APENAS UM TRIGGER
CREATE TRIGGER trigger_whatsapp_final
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- VERIFICAR RESULTADO FINAL
SELECT 
    COUNT(*) as total_triggers_final,
    'DEVE SER 1 AGORA' as verificacao
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND NOT t.tgisinternal;
