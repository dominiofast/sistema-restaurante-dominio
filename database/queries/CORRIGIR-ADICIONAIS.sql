-- CORRIGIR FUNÇÃO PARA INCLUIR ADICIONAIS

CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    pedido_record RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
    item_record RECORD;
    adicional_record RECORD;
    taxa_entrega DECIMAL := 0;
    itens_texto TEXT := '';
BEGIN
    -- Buscar pedido
    SELECT * INTO pedido_record FROM pedidos WHERE id = NEW.pedido_id;
    
    -- Buscar WhatsApp
    SELECT * INTO whatsapp_integration 
    FROM whatsapp_integrations 
    WHERE company_id = pedido_record.company_id
    LIMIT 1;
    
    IF whatsapp_integration IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Só executar no último item inserido
    IF EXISTS (SELECT 1 FROM pedido_itens WHERE pedido_id = NEW.pedido_id AND id > NEW.id) THEN
        RETURN NEW;
    END IF;
    
    -- Buscar taxa
    SELECT COALESCE(valor_total, 0) INTO taxa_entrega
    FROM pedido_itens WHERE pedido_id = NEW.pedido_id AND nome_produto ILIKE '%taxa%' LIMIT 1;
    
    -- Processar CADA ITEM com seus adicionais
    FOR item_record IN 
        SELECT id, nome_produto, quantidade, observacoes FROM pedido_itens 
        WHERE pedido_id = NEW.pedido_id AND NOT (nome_produto ILIKE '%taxa%')
        ORDER BY created_at
    LOOP
        -- Nome do item
        itens_texto := itens_texto || '➡ ' || item_record.quantidade || 'x ' || item_record.nome_produto || E'\n';
        
        -- BUSCAR ADICIONAIS DESTE ITEM
        DECLARE
            tem_adicionais BOOLEAN := FALSE;
        BEGIN
            -- Verificar se tem adicionais
            IF EXISTS (SELECT 1 FROM pedido_item_adicionais WHERE pedido_item_id = item_record.id) THEN
                tem_adicionais := TRUE;
                
                -- SABORES
                DECLARE sabores_text TEXT := ''; BEGIN
                    FOR adicional_record IN
                        SELECT nome_adicional, quantidade FROM pedido_item_adicionais
                        WHERE pedido_item_id = item_record.id
                        AND (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' 
                             OR nome_adicional ILIKE '%frango%' OR nome_adicional ILIKE '%bacon%')
                        ORDER BY nome_adicional
                    LOOP
                        sabores_text := sabores_text || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
                    END LOOP;
                    
                    IF sabores_text != '' THEN
                        itens_texto := itens_texto || '      Sabores Pizzas' || E'\n' || sabores_text;
                    END IF;
                END;
                
                -- BORDAS
                DECLARE bordas_text TEXT := ''; BEGIN
                    FOR adicional_record IN
                        SELECT nome_adicional, quantidade FROM pedido_item_adicionais
                        WHERE pedido_item_id = item_record.id AND nome_adicional ILIKE '%borda%'
                        ORDER BY nome_adicional
                    LOOP
                        bordas_text := bordas_text || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
                    END LOOP;
                    
                    IF bordas_text != '' THEN
                        itens_texto := itens_texto || '      Massas e Bordas' || E'\n' || bordas_text;
                    END IF;
                END;
                
                -- OUTROS ADICIONAIS
                DECLARE outros_text TEXT := ''; BEGIN
                    FOR adicional_record IN
                        SELECT nome_adicional, quantidade FROM pedido_item_adicionais
                        WHERE pedido_item_id = item_record.id
                        AND NOT (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' 
                                 OR nome_adicional ILIKE '%frango%' OR nome_adicional ILIKE '%bacon%'
                                 OR nome_adicional ILIKE '%borda%' OR nome_adicional ILIKE '%ketchup%' 
                                 OR nome_adicional ILIKE '%maionese%')
                        ORDER BY nome_adicional
                    LOOP
                        outros_text := outros_text || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || ' - adicional' || E'\n';
                    END LOOP;
                    
                    IF outros_text != '' THEN
                        itens_texto := itens_texto || '      Adicionais:' || E'\n' || outros_text;
                    END IF;
                END;
                
                -- CONDIMENTOS
                DECLARE condimentos_text TEXT := ''; BEGIN
                    FOR adicional_record IN
                        SELECT nome_adicional, quantidade FROM pedido_item_adicionais
                        WHERE pedido_item_id = item_record.id
                        AND (nome_adicional ILIKE '%ketchup%' OR nome_adicional ILIKE '%maionese%' 
                             OR nome_adicional ILIKE '%não enviar%')
                        ORDER BY nome_adicional
                    LOOP
                        condimentos_text := condimentos_text || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
                    END LOOP;
                    
                    IF condimentos_text != '' THEN
                        itens_texto := itens_texto || '      Deseja ketchup, maionese?' || E'\n' || condimentos_text;
                    END IF;
                END;
            END IF;
        END;
        
        -- Observações do item
        IF item_record.observacoes IS NOT NULL AND item_record.observacoes != '' THEN
            itens_texto := itens_texto || '      Obs: ' || item_record.observacoes || E'\n';
        END IF;
        
        itens_texto := itens_texto || E'\n';
    END LOOP;
    
    -- Montar mensagem final
    message_text := '*Pedido nº ' || COALESCE(pedido_record.numero_pedido, pedido_record.id) || '*' || E'\n\n' ||
                   '*Itens:*' || E'\n' ||
                   itens_texto;
    
    -- Pagamento
    IF pedido_record.pagamento ILIKE '%dinheiro%' THEN
        message_text := message_text || '💵 Dinheiro (não precisa de troco)' || E'\n\n';
    ELSIF pedido_record.pagamento ILIKE '%cartao%' THEN
        message_text := message_text || '💳 Cartão' || E'\n\n';
    ELSIF pedido_record.pagamento ILIKE '%pix%' THEN
        message_text := message_text || '📱 PIX' || E'\n\n';
    END IF;
    
    -- Entrega
    IF pedido_record.tipo = 'delivery' THEN
        message_text := message_text || '🛵 Delivery';
        IF taxa_entrega > 0 THEN
            message_text := message_text || ' (taxa de: R$ ' || REPLACE(taxa_entrega::text, '.', ',') || ')';
        END IF;
        message_text := message_text || E'\n🏠 ' || pedido_record.endereco || E'\n(Estimativa: entre 25~35 minutos)' || E'\n\n';
    END IF;
    
    -- Total
    message_text := message_text || '*Total: R$ ' || REPLACE(pedido_record.total::text, '.', ',') || '*' || E'\n\nObrigado pela preferência, se precisar de algo é só chamar! 😊';
    
    -- Enviar
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

-- CRIAR TRIGGER
CREATE TRIGGER trigger_whatsapp_notification_after_items
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();
