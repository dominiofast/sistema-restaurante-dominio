-- CRIAR FUNÇÃO DE TESTE PARA VER O QUE ESTÁ ACONTECENDO
CREATE OR REPLACE FUNCTION debug_whatsapp_adicionais(test_pedido_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := '';
    v_item_record RECORD;
    v_adicional_record RECORD;
    v_pedido_real_id INTEGER;
BEGIN
    -- Encontrar o ID real do pedido mais recente com este número
    SELECT id INTO v_pedido_real_id
    FROM pedidos 
    WHERE numero_pedido = test_pedido_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    v_result := 'Pedido real ID: ' || v_pedido_real_id || chr(10);
    
    -- Verificar itens
    FOR v_item_record IN 
        SELECT pi.*
        FROM pedido_itens pi
        WHERE pi.pedido_id = v_pedido_real_id
        AND pi.nome_produto NOT ILIKE '%taxa%'
        ORDER BY pi.created_at
    LOOP
        v_result := v_result || 'Item: ' || v_item_record.nome_produto || ' (ID: ' || v_item_record.id || ')' || chr(10);
        
        -- Verificar adicionais deste item
        FOR v_adicional_record IN 
            SELECT nome_adicional, categoria_nome, valor_unitario
            FROM pedido_item_adicionais
            WHERE pedido_item_id = v_item_record.id
            ORDER BY created_at
        LOOP
            v_result := v_result || '  -> ' || v_adicional_record.nome_adicional || 
                ' (R$ ' || v_adicional_record.valor_unitario || ')' || chr(10);
        END LOOP;
    END LOOP;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar o debug para pedido #7
SELECT debug_whatsapp_adicionais(7) as resultado_debug;