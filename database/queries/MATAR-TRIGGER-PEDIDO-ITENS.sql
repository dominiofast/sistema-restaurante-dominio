-- ========================================
-- SCRIPT FINAL: MATAR O TRIGGER CORRETO
-- ========================================

-- O PROBLEMA REAL: Trigger está na tabela PEDIDO_ITENS, não PEDIDOS!

-- 1. VER O QUE TEM NA TABELA PEDIDO_ITENS
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'pedido_itens'
ORDER BY trigger_name;

-- 2. REMOVER TRIGGERS DA TABELA PEDIDO_ITENS (LOCAL CORRETO)
DROP TRIGGER IF EXISTS trigger_whatsapp_notification_after_items ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_whatsapp_after_items ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_send_whatsapp_notification_after_items ON pedido_itens CASCADE;

-- 3. REMOVER A FUNÇÃO QUE GERA A MENSAGEM ANTIGA
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- 4. REMOVER QUALQUER OUTRO TRIGGER DE CONFIRMAÇÃO
DROP TRIGGER IF EXISTS trigger_pedido_confirmacao_whatsapp ON pedidos CASCADE;
DROP TRIGGER IF EXISTS send_whatsapp_confirmation ON pedidos CASCADE;

-- 5. CRIAR FUNÇÃO NOVA (SEM ESSAS MERDAS DE EMOJI E ═══)
CREATE OR REPLACE FUNCTION enviar_confirmacao_simples()
RETURNS TRIGGER AS $$
DECLARE
    msg TEXT;
    itens TEXT := '';
    item RECORD;
    config RECORD;
    taxa DECIMAL := 0;
BEGIN
    -- Só executar quando for o último item inserido
    IF NOT EXISTS (
        SELECT 1 FROM pedido_itens 
        WHERE pedido_id = NEW.pedido_id 
        AND id > NEW.id
    ) THEN
        -- Buscar WhatsApp
        SELECT * INTO config FROM whatsapp_integrations 
        WHERE company_id = (SELECT company_id FROM pedidos WHERE id = NEW.pedido_id)
        AND is_active = true LIMIT 1;
        
        IF config IS NULL THEN RETURN NEW; END IF;
        
        -- Buscar pedido
        SELECT * INTO item FROM pedidos WHERE id = NEW.pedido_id;
        
        -- Taxa
        SELECT COALESCE(valor_total, 0) INTO taxa
        FROM pedido_itens WHERE pedido_id = NEW.pedido_id AND nome_produto ILIKE '%taxa%' LIMIT 1;
        
        -- Processar itens
        FOR item IN
            SELECT nome_produto, quantidade
            FROM pedido_itens
            WHERE pedido_id = NEW.pedido_id AND NOT (nome_produto ILIKE '%taxa%')
        LOOP
            itens := itens || '➡ ' || item.quantidade || 'x ' || item.nome_produto || E'\n';
        END LOOP;
        
        -- Montar mensagem LIMPA
        SELECT * INTO item FROM pedidos WHERE id = NEW.pedido_id;
        
        msg := '*Pedido nº ' || COALESCE(item.numero_pedido, item.id) || '*' || E'\n\n' ||
               '*Itens:*' || E'\n' || itens || E'\n';
        
        IF item.pagamento ILIKE '%dinheiro%' THEN
            msg := msg || '💵 Dinheiro (não precisa de troco)' || E'\n\n';
        ELSIF item.pagamento ILIKE '%cartao%' THEN
            msg := msg || '💳 Cartão' || E'\n\n';
        ELSIF item.pagamento ILIKE '%pix%' THEN
            msg := msg || '📱 PIX' || E'\n\n';
        END IF;
        
        IF item.tipo = 'delivery' THEN
            msg := msg || '🛵 Delivery';
            IF taxa > 0 THEN
                msg := msg || ' (taxa de: R$ ' || REPLACE(taxa::text, '.', ',') || ')';
            END IF;
            msg := msg || E'\n' || '🏠 ' || COALESCE(item.endereco, '') || E'\n' ||
                   '(Estimativa: entre 25~35 minutos)' || E'\n\n';
        END IF;
        
        msg := msg || '*Total: R$ ' || REPLACE(item.total::text, '.', ',') || '*' || E'\n\n' ||
               'Obrigado pela preferência, se precisar de algo é só chamar! 😊';
        
        -- Enviar
        BEGIN
            PERFORM http_post(
                'https://apinocode01.megaapi.com.br/rest/sendMessage/' || config.instance_key || '/text',
                json_build_object('messageData', json_build_object('to', item.telefone, 'text', msg))::text,
                'application/json',
                ARRAY[http_header('Authorization', 'Bearer ' || config.token)]
            );
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGER NOVO NA TABELA CORRETA (PEDIDO_ITENS)
CREATE TRIGGER trigger_confirmacao_nova
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION enviar_confirmacao_simples();

-- 7. VERIFICAR RESULTADO
SELECT 'TRIGGERS EM PEDIDO_ITENS:' as info;
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'pedido_itens';

SELECT 'TRIGGERS EM PEDIDOS:' as info;
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'pedidos';
