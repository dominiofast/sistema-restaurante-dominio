-- EXECUTE ESTE SCRIPT EXATO NO SUPABASE (COPIA E COLA TUDO):

-- 1. FORÇA BRUTA: REMOVER TUDO
DROP TRIGGER IF EXISTS trigger_pedido_confirmacao_whatsapp ON pedidos CASCADE;
DROP TRIGGER IF EXISTS send_whatsapp_confirmation ON pedidos CASCADE;
DROP TRIGGER IF EXISTS notify_whatsapp_order_confirmation ON pedidos CASCADE;
DROP TRIGGER IF EXISTS trigger_order_whatsapp_notification ON pedidos CASCADE;
DROP TRIGGER IF EXISTS whatsapp_order_notification_trigger ON pedidos CASCADE;
DROP TRIGGER IF EXISTS auto_send_whatsapp_confirmation ON pedidos CASCADE;
DROP TRIGGER IF EXISTS send_single_whatsapp_confirmation ON pedidos CASCADE;
DROP TRIGGER IF EXISTS send_single_clean_confirmation ON pedidos CASCADE;

DROP FUNCTION IF EXISTS send_whatsapp_order_confirmation() CASCADE;
DROP FUNCTION IF EXISTS generate_order_confirmation_message() CASCADE;
DROP FUNCTION IF EXISTS notify_whatsapp_order_confirmation() CASCADE;
DROP FUNCTION IF EXISTS send_order_whatsapp_notification() CASCADE;
DROP FUNCTION IF EXISTS send_clean_order_confirmation() CASCADE;

-- 2. CRIAR FUNÇÃO NOVA E DEFINITIVA
CREATE OR REPLACE FUNCTION enviar_confirmacao_limpa()
RETURNS TRIGGER AS $$
DECLARE
    msg TEXT := '';
    itens TEXT := '';
    item RECORD;
    adicional RECORD;
    config RECORD;
    taxa DECIMAL := 0;
BEGIN
    -- WhatsApp config
    SELECT * INTO config FROM whatsapp_integrations 
    WHERE company_id = NEW.company_id AND is_active = true LIMIT 1;
    
    IF config IS NULL THEN RETURN NEW; END IF;
    
    -- Taxa de entrega
    SELECT COALESCE(valor_total, 0) INTO taxa
    FROM pedido_itens WHERE pedido_id = NEW.id AND nome_produto ILIKE '%taxa%' LIMIT 1;
    
    -- Processar itens
    FOR item IN
        SELECT id, nome_produto, quantidade, observacoes
        FROM pedido_itens
        WHERE pedido_id = NEW.id AND NOT (nome_produto ILIKE '%taxa%')
        ORDER BY created_at
    LOOP
        itens := itens || '➡ ' || item.quantidade || 'x ' || item.nome_produto || E'\n';
        
        -- Sabores
        DECLARE sabores TEXT := ''; BEGIN
            FOR adicional IN
                SELECT nome_adicional, quantidade FROM pedido_item_adicionais
                WHERE pedido_item_id = item.id
                AND (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' 
                     OR nome_adicional ILIKE '%frango%' OR nome_adicional ILIKE '%bacon%')
            LOOP
                sabores := sabores || '          ' || adicional.quantidade || 'x ' || adicional.nome_adicional || E'\n';
            END LOOP;
            IF sabores != '' THEN
                itens := itens || '      Sabores Pizzas' || E'\n' || sabores;
            END IF;
        END;
        
        -- Bordas
        DECLARE bordas TEXT := ''; BEGIN
            FOR adicional IN
                SELECT nome_adicional, quantidade FROM pedido_item_adicionais
                WHERE pedido_item_id = item.id AND nome_adicional ILIKE '%borda%'
            LOOP
                bordas := bordas || '          ' || adicional.quantidade || 'x ' || adicional.nome_adicional || E'\n';
            END LOOP;
            IF bordas != '' THEN
                itens := itens || '      Massas e Bordas' || E'\n' || bordas;
            END IF;
        END;
        
        -- Outros adicionais
        DECLARE outros TEXT := ''; BEGIN
            FOR adicional IN
                SELECT nome_adicional, quantidade FROM pedido_item_adicionais
                WHERE pedido_item_id = item.id
                AND NOT (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' 
                         OR nome_adicional ILIKE '%frango%' OR nome_adicional ILIKE '%bacon%'
                         OR nome_adicional ILIKE '%borda%' OR nome_adicional ILIKE '%ketchup%' 
                         OR nome_adicional ILIKE '%maionese%')
            LOOP
                outros := outros || '          ' || adicional.quantidade || 'x ' || adicional.nome_adicional || ' - adicional' || E'\n';
            END LOOP;
            IF outros != '' THEN
                itens := itens || '      Adicionais:' || E'\n' || outros;
            END IF;
        END;
        
        -- Condimentos
        DECLARE condimentos TEXT := ''; BEGIN
            FOR adicional IN
                SELECT nome_adicional, quantidade FROM pedido_item_adicionais
                WHERE pedido_item_id = item.id
                AND (nome_adicional ILIKE '%ketchup%' OR nome_adicional ILIKE '%maionese%' OR nome_adicional ILIKE '%não%')
            LOOP
                condimentos := condimentos || '          ' || adicional.quantidade || 'x ' || adicional.nome_adicional || E'\n';
            END LOOP;
            IF condimentos != '' THEN
                itens := itens || '      Deseja ketchup, maionese?' || E'\n' || condimentos;
            END IF;
        END;
        
        itens := itens || E'\n';
    END LOOP;
    
    -- Montar mensagem final
    msg := '*Pedido nº ' || COALESCE(NEW.numero_pedido, NEW.id) || '*' || E'\n\n' ||
           '*Itens:*' || E'\n' || itens;
    
    -- Pagamento
    IF NEW.pagamento ILIKE '%dinheiro%' THEN
        msg := msg || '💵 Dinheiro (não precisa de troco)' || E'\n\n';
    ELSIF NEW.pagamento ILIKE '%cartao%' THEN
        msg := msg || '💳 Cartão' || E'\n\n';
    ELSIF NEW.pagamento ILIKE '%pix%' THEN
        msg := msg || '📱 PIX' || E'\n\n';
    END IF;
    
    -- Entrega
    IF NEW.tipo = 'delivery' THEN
        msg := msg || '🛵 Delivery';
        IF taxa > 0 THEN
            msg := msg || ' (taxa de: R$ ' || REPLACE(taxa::text, '.', ',') || ')';
        END IF;
        msg := msg || E'\n' || '🏠 ' || COALESCE(NEW.endereco, '') || E'\n' ||
               '(Estimativa: entre 25~35 minutos)' || E'\n\n';
    END IF;
    
    -- Total
    msg := msg || '*Total: R$ ' || REPLACE(NEW.total::text, '.', ',') || '*' || E'\n\n' ||
           'Obrigado pela preferência, se precisar de algo é só chamar! 😊';
    
    -- Enviar
    BEGIN
        PERFORM http_post(
            'https://apinocode01.megaapi.com.br/rest/sendMessage/' || config.instance_key || '/text',
            json_build_object(
                'messageData', json_build_object(
                    'to', NEW.telefone,
                    'text', msg
                )
            )::text,
            'application/json',
            ARRAY[
                http_header('Authorization', 'Bearer ' || config.token),
                http_header('Content-Type', 'application/json')
            ]
        );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRIAR TRIGGER DEFINITIVO
CREATE TRIGGER trigger_confirmacao_definitiva
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.status != NEW.status AND NEW.status = 'confirmado')
    EXECUTE FUNCTION enviar_confirmacao_limpa();

-- 4. VERIFICAR
SELECT 'RESULTADO FINAL:' as info;
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'pedidos';
