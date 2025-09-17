-- CORRIGIR ERRO: ADICIONAR VARIÁVEL FALTANTE

CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    pedido_record RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;  -- ← VARIÁVEL FALTANTE DECLARADA
    item_record RECORD;
    adicional_record RECORD;
    taxa_entrega DECIMAL := 0;
    itens_texto TEXT := '';
BEGIN
    SELECT * INTO pedido_record FROM pedidos WHERE id = NEW.pedido_id;
    SELECT * INTO whatsapp_integration FROM whatsapp_integrations WHERE company_id = pedido_record.company_id LIMIT 1;
    
    IF whatsapp_integration IS NULL THEN RETURN NEW; END IF;
    
    -- Só no último item
    IF EXISTS (SELECT 1 FROM pedido_itens WHERE pedido_id = NEW.pedido_id AND id > NEW.id) THEN
        RETURN NEW;
    END IF;
    
    SELECT COALESCE(valor_total, 0) INTO taxa_entrega FROM pedido_itens WHERE pedido_id = NEW.pedido_id AND nome_produto ILIKE '%taxa%' LIMIT 1;
    
    -- Processar itens com adicionais
    FOR item_record IN 
        SELECT id, nome_produto, quantidade, observacoes FROM pedido_itens 
        WHERE pedido_id = NEW.pedido_id AND NOT (nome_produto ILIKE '%taxa%')
        ORDER BY created_at
    LOOP
        itens_texto := itens_texto || '➡ ' || item_record.quantidade || 'x ' || item_record.nome_produto || E'\n';
        
        -- SABORES
        FOR adicional_record IN
            SELECT nome_adicional, quantidade FROM pedido_item_adicionais
            WHERE pedido_item_id = item_record.id
            AND (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' OR nome_adicional ILIKE '%frango%')
        LOOP
            itens_texto := itens_texto || '      Sabores Pizzas' || E'\n';
            itens_texto := itens_texto || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
            EXIT; -- Só mostrar header uma vez
        END LOOP;
        
        -- Continue os sabores sem header repetido
        FOR adicional_record IN
            SELECT nome_adicional, quantidade FROM pedido_item_adicionais
            WHERE pedido_item_id = item_record.id
            AND (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' OR nome_adicional ILIKE '%frango%')
            ORDER BY nome_adicional
        LOOP
            itens_texto := itens_texto || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
        END LOOP;
        
        -- BORDAS
        FOR adicional_record IN
            SELECT nome_adicional, quantidade FROM pedido_item_adicionais
            WHERE pedido_item_id = item_record.id AND nome_adicional ILIKE '%borda%'
        LOOP
            itens_texto := itens_texto || '      Massas e Bordas' || E'\n';
            itens_texto := itens_texto || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
        END LOOP;
        
        -- OUTROS ADICIONAIS
        FOR adicional_record IN
            SELECT nome_adicional, quantidade FROM pedido_item_adicionais
            WHERE pedido_item_id = item_record.id
            AND NOT (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' OR nome_adicional ILIKE '%frango%' OR nome_adicional ILIKE '%borda%' OR nome_adicional ILIKE '%ketchup%')
        LOOP
            itens_texto := itens_texto || '      Adicionais:' || E'\n';
            itens_texto := itens_texto || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || ' - adicional' || E'\n';
        END LOOP;
        
        -- CONDIMENTOS
        FOR adicional_record IN
            SELECT nome_adicional, quantidade FROM pedido_item_adicionais
            WHERE pedido_item_id = item_record.id AND nome_adicional ILIKE '%ketchup%'
        LOOP
            itens_texto := itens_texto || '      Deseja ketchup, maionese?' || E'\n';
            itens_texto := itens_texto || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
        END LOOP;
        
        itens_texto := itens_texto || E'\n';
    END LOOP;
    
    message_text := '*Pedido nº ' || COALESCE(pedido_record.numero_pedido, pedido_record.id) || '*' || E'\n\n*Itens:*' || E'\n' || itens_texto;
    
    IF pedido_record.pagamento ILIKE '%dinheiro%' THEN
        message_text := message_text || '💵 Dinheiro (não precisa de troco)' || E'\n\n';
    ELSIF pedido_record.pagamento ILIKE '%cartao%' THEN
        message_text := message_text || '💳 Cartão' || E'\n\n';
    ELSIF pedido_record.pagamento ILIKE '%pix%' THEN
        message_text := message_text || '📱 PIX' || E'\n\n';
    END IF;
    
    IF pedido_record.tipo = 'delivery' THEN
        message_text := message_text || '🛵 Delivery';
        IF taxa_entrega > 0 THEN
            message_text := message_text || ' (taxa de: R$ ' || REPLACE(taxa_entrega::text, '.', ',') || ')';
        END IF;
        message_text := message_text || E'\n🏠 ' || pedido_record.endereco || E'\n(Estimativa: entre 25~35 minutos)' || E'\n\n';
    END IF;
    
    message_text := message_text || '*Total: R$ ' || REPLACE(pedido_record.total::text, '.', ',') || '*' || E'\n\nObrigado pela preferência, se precisar de algo é só chamar! 😊';
    
    BEGIN
        SELECT content INTO api_response
        FROM http((
            'POST',
            'https://apinocode01.megaapi.com.br/rest/sendMessage/' || whatsapp_integration.instance_key || '/text',
            ARRAY[
                http_header('Authorization', 'Bearer ' || whatsapp_integration.token),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'messageData', json_build_object(
                    'to', pedido_record.telefone,
                    'text', message_text
                )
            )::text
        ));
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
