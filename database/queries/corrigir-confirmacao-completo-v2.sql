-- ========================================
-- CORREÇÃO DEFINITIVA: CONFIRMAÇÃO COM ADICIONAIS COMPLETOS
-- ========================================

-- PASSO 1: REMOVER TODOS OS TRIGGERS DUPLICADOS
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT trigger_name
        FROM information_schema.triggers 
        WHERE event_object_table = 'pedidos'
        AND (trigger_name ILIKE '%confirmation%' 
             OR trigger_name ILIKE '%whatsapp%' 
             OR trigger_name ILIKE '%notification%')
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON pedidos';
        RAISE NOTICE 'Removido trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- PASSO 2: REMOVER FUNÇÕES ANTIGAS
DROP FUNCTION IF EXISTS send_whatsapp_order_confirmation();
DROP FUNCTION IF EXISTS generate_order_confirmation_message();
DROP FUNCTION IF EXISTS notify_whatsapp_order_confirmation();
DROP FUNCTION IF EXISTS send_order_whatsapp_notification();

-- PASSO 3: CRIAR FUNÇÃO NOVA COM ADICIONAIS COMPLETOS
CREATE OR REPLACE FUNCTION send_clean_order_confirmation()
RETURNS TRIGGER AS $$
DECLARE
    message_text TEXT := '';
    pedido_itens_text TEXT := '';
    item_record RECORD;
    adicional_record RECORD;
    api_response TEXT;
    whatsapp_integration RECORD;
    pedido_record RECORD;
    taxa_entrega_valor DECIMAL := 0;
BEGIN
    -- Buscar dados do pedido
    SELECT * INTO pedido_record FROM pedidos WHERE id = NEW.id;
    
    -- Buscar WhatsApp
    SELECT * INTO whatsapp_integration 
    FROM whatsapp_integrations 
    WHERE company_id = pedido_record.company_id AND is_active = true
    LIMIT 1;
    
    IF whatsapp_integration IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Processar cada item com TODOS os adicionais
    FOR item_record IN
        SELECT pi.id, pi.nome_produto, pi.quantidade, pi.observacoes
        FROM pedido_itens pi
        WHERE pi.pedido_id = NEW.id
        AND pi.nome_produto NOT ILIKE '%taxa%'
        AND pi.nome_produto NOT ILIKE '%entrega%'
        ORDER BY pi.created_at
    LOOP
        -- Item principal
        pedido_itens_text := pedido_itens_text || '➡ ' || item_record.quantidade || 'x ' || item_record.nome_produto || E'\n';
        
        -- CATEGORIA 1: SABORES DE PIZZAS
        DECLARE
            sabores_text TEXT := '';
            bordas_text TEXT := '';
            adicionais_text TEXT := '';
            condimentos_text TEXT := '';
        BEGIN
            -- Buscar sabores
            FOR adicional_record IN
                SELECT pia.nome_adicional, pia.quantidade
                FROM pedido_item_adicionais pia
                WHERE pia.pedido_item_id = item_record.id
                AND (pia.nome_adicional ILIKE '%queijo%' OR pia.nome_adicional ILIKE '%calabresa%' 
                     OR pia.nome_adicional ILIKE '%frango%' OR pia.nome_adicional ILIKE '%margherita%'
                     OR pia.nome_adicional ILIKE '%portuguesa%' OR pia.nome_adicional ILIKE '%bacon%'
                     OR pia.nome_adicional ILIKE '%mussarela%' OR pia.nome_adicional ILIKE '%carne%'
                     OR pia.nome_adicional ILIKE '%atum%' OR pia.nome_adicional ILIKE '%presunto%'
                     OR pia.nome_adicional ILIKE '%tomate%' OR pia.nome_adicional ILIKE '%cebola%'
                     OR pia.nome_adicional LIKE '%Queijos%' OR pia.nome_adicional LIKE '%Pizza%')
                ORDER BY pia.nome_adicional
            LOOP
                sabores_text := sabores_text || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
            END LOOP;
            
            IF sabores_text != '' THEN
                pedido_itens_text := pedido_itens_text || '      Sabores Pizzas' || E'\n' || sabores_text;
            END IF;
            
            -- CATEGORIA 2: MASSAS E BORDAS
            FOR adicional_record IN
                SELECT pia.nome_adicional, pia.quantidade
                FROM pedido_item_adicionais pia
                WHERE pia.pedido_item_id = item_record.id
                AND (pia.nome_adicional ILIKE '%borda%' OR pia.nome_adicional ILIKE '%massa%')
                ORDER BY pia.nome_adicional
            LOOP
                bordas_text := bordas_text || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
            END LOOP;
            
            IF bordas_text != '' THEN
                pedido_itens_text := pedido_itens_text || '      Massas e Bordas' || E'\n' || bordas_text;
            END IF;
            
            -- CATEGORIA 3: OUTROS ADICIONAIS
            FOR adicional_record IN
                SELECT pia.nome_adicional, pia.quantidade
                FROM pedido_item_adicionais pia
                WHERE pia.pedido_item_id = item_record.id
                -- NÃO é sabor
                AND NOT (pia.nome_adicional ILIKE '%queijo%' OR pia.nome_adicional ILIKE '%calabresa%' 
                         OR pia.nome_adicional ILIKE '%frango%' OR pia.nome_adicional ILIKE '%margherita%'
                         OR pia.nome_adicional ILIKE '%portuguesa%' OR pia.nome_adicional ILIKE '%bacon%'
                         OR pia.nome_adicional ILIKE '%mussarela%' OR pia.nome_adicional ILIKE '%carne%'
                         OR pia.nome_adicional ILIKE '%atum%' OR pia.nome_adicional ILIKE '%presunto%'
                         OR pia.nome_adicional ILIKE '%tomate%' OR pia.nome_adicional LIKE '%Queijos%'
                         OR pia.nome_adicional LIKE '%Pizza%')
                -- NÃO é borda/massa
                AND NOT (pia.nome_adicional ILIKE '%borda%' OR pia.nome_adicional ILIKE '%massa%')
                -- NÃO é condimento
                AND NOT (pia.nome_adicional ILIKE '%ketchup%' OR pia.nome_adicional ILIKE '%maionese%' 
                         OR pia.nome_adicional ILIKE '%não enviar%' OR pia.nome_adicional ILIKE '%molho%')
                ORDER BY pia.nome_adicional
            LOOP
                adicionais_text := adicionais_text || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || ' - adicional' || E'\n';
            END LOOP;
            
            IF adicionais_text != '' THEN
                pedido_itens_text := pedido_itens_text || '      Adicionais:' || E'\n' || adicionais_text;
            END IF;
            
            -- CATEGORIA 4: CONDIMENTOS
            FOR adicional_record IN
                SELECT pia.nome_adicional, pia.quantidade
                FROM pedido_item_adicionais pia
                WHERE pia.pedido_item_id = item_record.id
                AND (pia.nome_adicional ILIKE '%ketchup%' OR pia.nome_adicional ILIKE '%maionese%' 
                     OR pia.nome_adicional ILIKE '%não enviar%' OR pia.nome_adicional ILIKE '%molho%')
                ORDER BY pia.nome_adicional
            LOOP
                condimentos_text := condimentos_text || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
            END LOOP;
            
            IF condimentos_text != '' THEN
                pedido_itens_text := pedido_itens_text || '      Deseja ketchup, maionese?' || E'\n' || condimentos_text;
            END IF;
        END;
        
        -- Observações do item
        IF item_record.observacoes IS NOT NULL AND item_record.observacoes != '' THEN
            pedido_itens_text := pedido_itens_text || '      Obs: ' || item_record.observacoes || E'\n';
        END IF;
        
        -- Linha em branco entre itens
        pedido_itens_text := pedido_itens_text || E'\n';
    END LOOP;
    
    -- Buscar taxa de entrega
    SELECT COALESCE(valor_total, 0) INTO taxa_entrega_valor
    FROM pedido_itens 
    WHERE pedido_id = NEW.id 
    AND (nome_produto ILIKE '%taxa%' OR nome_produto ILIKE '%entrega%')
    LIMIT 1;
    
    -- Montar mensagem final completa
    message_text := '*Pedido nº ' || COALESCE(pedido_record.numero_pedido, pedido_record.id) || '*' || E'\n\n' ||
                   '*Itens:*' || E'\n' ||
                   pedido_itens_text;
    
    -- Pagamento
    IF pedido_record.pagamento ILIKE '%dinheiro%' THEN
        IF pedido_record.pagamento ILIKE '%troco%' THEN
            message_text := message_text || '💵 ' || pedido_record.pagamento || E'\n\n';
        ELSE
            message_text := message_text || '💵 Dinheiro (não precisa de troco)' || E'\n\n';
        END IF;
    ELSIF pedido_record.pagamento ILIKE '%cartao%' OR pedido_record.pagamento ILIKE '%cartão%' THEN
        message_text := message_text || '💳 Cartão' || E'\n\n';
    ELSIF pedido_record.pagamento ILIKE '%pix%' THEN
        message_text := message_text || '📱 PIX' || E'\n\n';
    ELSE
        message_text := message_text || '💳 ' || pedido_record.pagamento || E'\n\n';
    END IF;
    
    -- Entrega
    IF pedido_record.tipo = 'delivery' THEN
        message_text := message_text || '🛵 Delivery';
        IF taxa_entrega_valor > 0 THEN
            message_text := message_text || ' (taxa de: R$ ' || REPLACE(taxa_entrega_valor::text, '.', ',') || ')';
        END IF;
        message_text := message_text || E'\n';
        
        IF pedido_record.endereco IS NOT NULL THEN
            message_text := message_text || '🏠 ' || pedido_record.endereco || E'\n';
        END IF;
        
        message_text := message_text || '(Estimativa: entre 25~35 minutos)' || E'\n\n';
    ELSE
        message_text := message_text || '🏪 Retirada no balcão' || E'\n' ||
                       '(Estimativa: entre 20~30 minutos)' || E'\n\n';
    END IF;
    
    -- Total
    message_text := message_text || 
        '*Total: R$ ' || REPLACE(COALESCE(pedido_record.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
        'Obrigado pela preferência, se precisar de algo é só chamar! 😊';
    
    -- Enviar WhatsApp
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
        )::http_request);
        
    EXCEPTION
        WHEN OTHERS THEN
            NULL; -- Ignorar erros para não quebrar
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 4: CRIAR TRIGGER ÚNICO
CREATE TRIGGER send_single_clean_confirmation
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'confirmado')
    EXECUTE FUNCTION send_clean_order_confirmation();

-- PASSO 5: VERIFICAR RESULTADO
SELECT 
    trigger_name, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos'
ORDER BY trigger_name;
