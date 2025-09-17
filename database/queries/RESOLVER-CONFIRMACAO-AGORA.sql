-- ========================================
-- RESOLVER CONFIRMAÇÃO AGORA - FORÇA BRUTA
-- ========================================

-- PASSO 1: EXECUTE ESTE PRIMEIRO (debug)
SELECT 
    trigger_name,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos'
ORDER BY trigger_name;

-- PASSO 2: FORÇAR REMOÇÃO DE TUDO (FORÇA BRUTA)
DO $$
DECLARE
    trigger_name_var TEXT;
    func_name_var TEXT;
BEGIN
    -- Dropar TODOS os triggers da tabela pedidos
    FOR trigger_name_var IN
        SELECT trigger_name
        FROM information_schema.triggers 
        WHERE event_object_table = 'pedidos'
    LOOP
        EXECUTE 'DROP TRIGGER ' || trigger_name_var || ' ON pedidos CASCADE';
        RAISE NOTICE 'REMOVIDO TRIGGER: %', trigger_name_var;
    END LOOP;
    
    -- Dropar TODAS as funções que mencionam confirmação
    FOR func_name_var IN
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_definition ILIKE '%confirmação%'
        AND routine_schema = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION ' || func_name_var || '() CASCADE';
        RAISE NOTICE 'REMOVIDA FUNÇÃO: %', func_name_var;
    END LOOP;
END $$;

-- PASSO 3: CRIAR FUNÇÃO NOVA (SEM EMOJIS ANTIGOS)
CREATE OR REPLACE FUNCTION send_new_confirmation()
RETURNS TRIGGER AS $$
DECLARE
    message_text TEXT;
    item_text TEXT := '';
    item_record RECORD;
    adicional_record RECORD;
    api_response TEXT;
    whatsapp_config RECORD;
    taxa_entrega DECIMAL := 0;
BEGIN
    -- Buscar WhatsApp config
    SELECT * INTO whatsapp_config 
    FROM whatsapp_integrations 
    WHERE company_id = NEW.company_id AND is_active = true
    LIMIT 1;
    
    IF whatsapp_config IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar taxa de entrega
    SELECT COALESCE(valor_total, 0) INTO taxa_entrega
    FROM pedido_itens 
    WHERE pedido_id = NEW.id 
    AND nome_produto ILIKE '%taxa%'
    LIMIT 1;
    
    -- Processar itens principais
    FOR item_record IN
        SELECT pi.id, pi.nome_produto, pi.quantidade, pi.observacoes
        FROM pedido_itens pi
        WHERE pi.pedido_id = NEW.id
        AND NOT (pi.nome_produto ILIKE '%taxa%' OR pi.nome_produto ILIKE '%entrega%')
        ORDER BY pi.created_at
    LOOP
        -- Item principal
        item_text := item_text || '➡ ' || item_record.quantidade || 'x ' || item_record.nome_produto || E'\n';
        
        -- ADICIONAIS POR CATEGORIA
        DECLARE
            sabores TEXT := '';
            bordas TEXT := '';
            outros TEXT := '';
            condimentos TEXT := '';
        BEGIN
            -- Sabores
            FOR adicional_record IN
                SELECT nome_adicional, quantidade
                FROM pedido_item_adicionais
                WHERE pedido_item_id = item_record.id
                AND (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' 
                     OR nome_adicional ILIKE '%frango%' OR nome_adicional ILIKE '%bacon%'
                     OR nome_adicional ILIKE '%presunto%' OR nome_adicional ILIKE '%atum%'
                     OR nome_adicional ILIKE '%carne%' OR nome_adicional ILIKE '%portuguesa%'
                     OR nome_adicional ILIKE '%margherita%' OR nome_adicional ILIKE '%mussarela%')
            LOOP
                sabores := sabores || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
            END LOOP;
            
            IF sabores != '' THEN
                item_text := item_text || '      Sabores Pizzas' || E'\n' || sabores;
            END IF;
            
            -- Bordas
            FOR adicional_record IN
                SELECT nome_adicional, quantidade
                FROM pedido_item_adicionais
                WHERE pedido_item_id = item_record.id
                AND (nome_adicional ILIKE '%borda%' OR nome_adicional ILIKE '%massa%')
            LOOP
                bordas := bordas || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
            END LOOP;
            
            IF bordas != '' THEN
                item_text := item_text || '      Massas e Bordas' || E'\n' || bordas;
            END IF;
            
            -- Outros adicionais
            FOR adicional_record IN
                SELECT nome_adicional, quantidade
                FROM pedido_item_adicionais
                WHERE pedido_item_id = item_record.id
                AND NOT (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' 
                         OR nome_adicional ILIKE '%frango%' OR nome_adicional ILIKE '%bacon%'
                         OR nome_adicional ILIKE '%presunto%' OR nome_adicional ILIKE '%atum%'
                         OR nome_adicional ILIKE '%carne%' OR nome_adicional ILIKE '%portuguesa%'
                         OR nome_adicional ILIKE '%margherita%' OR nome_adicional ILIKE '%mussarela%')
                AND NOT (nome_adicional ILIKE '%borda%' OR nome_adicional ILIKE '%massa%')
                AND NOT (nome_adicional ILIKE '%ketchup%' OR nome_adicional ILIKE '%maionese%' 
                         OR nome_adicional ILIKE '%não enviar%')
            LOOP
                outros := outros || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || ' - adicional' || E'\n';
            END LOOP;
            
            IF outros != '' THEN
                item_text := item_text || '      Adicionais:' || E'\n' || outros;
            END IF;
            
            -- Condimentos
            FOR adicional_record IN
                SELECT nome_adicional, quantidade
                FROM pedido_item_adicionais
                WHERE pedido_item_id = item_record.id
                AND (nome_adicional ILIKE '%ketchup%' OR nome_adicional ILIKE '%maionese%' 
                     OR nome_adicional ILIKE '%não enviar%')
            LOOP
                condimentos := condimentos || '          ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional || E'\n';
            END LOOP;
            
            IF condimentos != '' THEN
                item_text := item_text || '      Deseja ketchup, maionese?' || E'\n' || condimentos;
            END IF;
        END;
        
        item_text := item_text || E'\n';
    END LOOP;
    
    -- Montar mensagem NOVA
    message_text := '*Pedido nº ' || COALESCE(NEW.numero_pedido, NEW.id) || '*' || E'\n\n' ||
                   '*Itens:*' || E'\n' ||
                   item_text;
    
    -- Pagamento
    IF NEW.pagamento ILIKE '%dinheiro%' THEN
        message_text := message_text || '💵 Dinheiro (não precisa de troco)' || E'\n\n';
    ELSIF NEW.pagamento ILIKE '%cartao%' OR NEW.pagamento ILIKE '%cartão%' THEN
        message_text := message_text || '💳 Cartão' || E'\n\n';
    ELSIF NEW.pagamento ILIKE '%pix%' THEN
        message_text := message_text || '📱 PIX' || E'\n\n';
    END IF;
    
    -- Entrega
    IF NEW.tipo = 'delivery' THEN
        message_text := message_text || '🛵 Delivery';
        IF taxa_entrega > 0 THEN
            message_text := message_text || ' (taxa de: R$ ' || REPLACE(taxa_entrega::text, '.', ',') || ')';
        END IF;
        message_text := message_text || E'\n';
        
        IF NEW.endereco IS NOT NULL THEN
            message_text := message_text || '🏠 ' || NEW.endereco || E'\n';
        END IF;
        
        message_text := message_text || '(Estimativa: entre 25~35 minutos)' || E'\n\n';
    END IF;
    
    -- Total
    message_text := message_text || 
        '*Total: R$ ' || REPLACE(NEW.total::text, '.', ',') || '*' || E'\n\n' ||
        'Obrigado pela preferência, se precisar de algo é só chamar! 😊';
    
    -- Enviar
    BEGIN
        SELECT content INTO api_response
        FROM http((
            'POST',
            'https://apinocode01.megaapi.com.br/rest/sendMessage/' || whatsapp_config.instance_key || '/text',
            ARRAY[
                http_header('Authorization', 'Bearer ' || whatsapp_config.token),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'messageData', json_build_object(
                    'to', NEW.telefone,
                    'text', message_text
                )
            )::text
        )::http_request);
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 4: CRIAR TRIGGER NOVO
CREATE TRIGGER new_clean_confirmation_trigger
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.status != NEW.status AND NEW.status = 'confirmado')
    EXECUTE FUNCTION send_new_confirmation();

-- PASSO 5: VERIFICAR FINAL
SELECT 'TRIGGERS FINAIS:' as status;
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'pedidos';
