-- FUNÇÃO PARA DEBUGGAR EXATAMENTE ONDE ESTÁ FALHANDO
CREATE OR REPLACE FUNCTION debug_whatsapp_adicionais_completo(test_pedido_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := '';
    v_item_record RECORD;
    v_adicional_record RECORD;
    v_pedido_real_id INTEGER;
    v_item_completo TEXT;
    v_adicionais_item TEXT;
    v_count INTEGER;
BEGIN
    -- Encontrar o ID real do pedido mais recente com este número
    SELECT id INTO v_pedido_real_id
    FROM pedidos 
    WHERE numero_pedido = test_pedido_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    v_result := 'DEBUG COMPLETO - Pedido ID: ' || v_pedido_real_id || chr(10);
    
    -- Verificar itens (SEM TAXA)
    FOR v_item_record IN 
        SELECT pi.*
        FROM pedido_itens pi
        WHERE pi.pedido_id = v_pedido_real_id
        AND pi.nome_produto NOT ILIKE '%taxa%'
        ORDER BY pi.created_at
    LOOP
        v_result := v_result || 'ITEM: ' || v_item_record.nome_produto || ' (ID: ' || v_item_record.id || ')' || chr(10);
        
        -- Contar adicionais deste item
        SELECT COUNT(*) INTO v_count
        FROM pedido_item_adicionais
        WHERE pedido_item_id = v_item_record.id;
        
        v_result := v_result || '  Adicionais encontrados: ' || v_count || chr(10);
        
        -- Iniciar processamento como na função original
        v_item_completo := '• ' || v_item_record.quantidade || 'x ' || v_item_record.nome_produto || ' - R$ ' || REPLACE(v_item_record.valor_total::text, '.', ',');
        v_result := v_result || '  Item base: ' || v_item_completo || chr(10);
        
        -- Buscar adicionais deste item
        v_adicionais_item := '';
        FOR v_adicional_record IN 
            SELECT nome_adicional, categoria_nome, quantidade, valor_unitario
            FROM pedido_item_adicionais
            WHERE pedido_item_id = v_item_record.id
            ORDER BY created_at
        LOOP
            IF v_adicionais_item != '' THEN
                v_adicionais_item := v_adicionais_item || E'\n';
            END IF;
            
            -- Formatar adicional
            IF v_adicional_record.valor_unitario > 0 THEN
                v_adicionais_item := v_adicionais_item || '  ➤ ' || v_adicional_record.nome_adicional || 
                    ' (+R$ ' || REPLACE(v_adicional_record.valor_unitario::text, '.', ',') || ')';
            ELSE
                v_adicionais_item := v_adicionais_item || '  ➤ ' || v_adicional_record.nome_adicional;
            END IF;
            
            v_result := v_result || '    Adicional processado: ' || v_adicional_record.nome_adicional || ' (R$ ' || v_adicional_record.valor_unitario || ')' || chr(10);
        END LOOP;
        
        -- Adicionar adicionais ao item se houver
        IF v_adicionais_item != '' THEN
            v_item_completo := v_item_completo || E'\n' || v_adicionais_item;
            v_result := v_result || '  ITEM FINAL COM ADICIONAIS: ' || chr(10) || v_item_completo || chr(10);
        ELSE
            v_result := v_result || '  ITEM SEM ADICIONAIS (v_adicionais_item vazio)' || chr(10);
        END IF;
        
        v_result := v_result || '---' || chr(10);
    END LOOP;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar o debug para pedido #8
SELECT debug_whatsapp_adicionais_completo(8) as resultado_debug_completo;