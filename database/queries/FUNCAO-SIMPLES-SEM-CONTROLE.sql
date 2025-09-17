-- FUNCAO SIMPLES QUE FUNCIONE
-- Remover controle de duplicacao e fazer trigger mais inteligente

-- Remover trigger antigo
DROP TRIGGER IF EXISTS trigger_whatsapp_sem_duplicacao ON pedido_itens;

-- Funcao simples SEM controle de duplicacao
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
    -- Contar quantos itens tem no pedido
    SELECT COUNT(*) INTO v_total_itens
    FROM pedido_itens 
    WHERE pedido_id = NEW.pedido_id;
    
    -- SO ENVIAR SE FOR O PRIMEIRO ITEM (evita duplicacao)
    IF v_total_itens > 1 THEN
        RETURN NEW;
    END IF;
    
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
    
    -- Montar lista de itens (TODOS os itens do pedido)
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

-- Criar trigger que SO executa no PRIMEIRO item
CREATE TRIGGER trigger_whatsapp_primeiro_item
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

SELECT 'Trigger simples criado - executa no primeiro item apenas!' as status;
