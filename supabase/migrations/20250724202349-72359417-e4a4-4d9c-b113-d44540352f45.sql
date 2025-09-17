-- Função SQL atômica para criar pedido PDV completo
-- Garante consistência de dados e escalabilidade para 1000+ empresas
CREATE OR REPLACE FUNCTION public.criar_pedido_pdv_completo(
    p_company_id UUID,
    p_nome TEXT,
    p_telefone TEXT,
    p_itens TEXT,
    p_endereco TEXT DEFAULT NULL,
    p_tipo TEXT DEFAULT 'balcao',
    p_pagamento TEXT DEFAULT NULL,
    p_total NUMERIC DEFAULT 0,
    p_observacoes TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_pedido_id UUID;
    v_numero_pedido INTEGER;
    v_item JSON;
    v_item_id UUID;
    v_adicional JSON;
    v_itens_array JSON[];
BEGIN
    -- Validações de entrada
    IF p_company_id IS NULL OR p_nome IS NULL OR p_telefone IS NULL THEN
        RAISE EXCEPTION 'Dados obrigatórios não fornecidos';
    END IF;
    
    -- Parse dos itens JSON
    v_itens_array := ARRAY(SELECT json_array_elements(p_itens::JSON));
    
    IF array_length(v_itens_array, 1) = 0 THEN
        RAISE EXCEPTION 'Pelo menos um item é obrigatório';
    END IF;
    
    -- Inserir pedido principal
    INSERT INTO public.pedidos (
        company_id,
        nome,
        telefone,
        endereco,
        tipo,
        pagamento,
        total,
        status,
        observacoes
    ) VALUES (
        p_company_id,
        p_nome,
        p_telefone,
        p_endereco,
        p_tipo,
        p_pagamento,
        p_total,
        'analise',
        p_observacoes
    ) RETURNING id, numero_pedido INTO v_pedido_id, v_numero_pedido;
    
    -- Inserir itens do pedido
    FOR i IN 1..array_length(v_itens_array, 1) LOOP
        v_item := v_itens_array[i];
        
        -- Validar dados do item
        IF (v_item->>'produto_id') IS NULL OR 
           (v_item->>'nome_produto') IS NULL OR 
           (v_item->>'quantidade') IS NULL OR 
           (v_item->>'preco_unitario') IS NULL THEN
            RAISE EXCEPTION 'Dados do item inválidos';
        END IF;
        
        -- Inserir item
        INSERT INTO public.pedido_itens (
            pedido_id,
            produto_id,
            nome_produto,
            quantidade,
            valor_unitario,
            valor_total
        ) VALUES (
            v_pedido_id,
            (v_item->>'produto_id')::UUID,
            v_item->>'nome_produto',
            (v_item->>'quantidade')::INTEGER,
            (v_item->>'preco_unitario')::NUMERIC,
            (v_item->>'quantidade')::INTEGER * (v_item->>'preco_unitario')::NUMERIC
        ) RETURNING id INTO v_item_id;
        
        -- Inserir adicionais se existirem
        IF v_item->'adicionais' IS NOT NULL THEN
            FOR v_adicional IN SELECT json_array_elements(v_item->'adicionais') LOOP
                INSERT INTO public.pedido_item_adicionais (
                    pedido_item_id,
                    categoria_nome,
                    nome_adicional,
                    quantidade,
                    valor_unitario,
                    valor_total
                ) VALUES (
                    v_item_id,
                    'Adicional',
                    v_adicional->>'nome',
                    (v_adicional->>'quantidade')::INTEGER,
                    (v_adicional->>'preco')::NUMERIC,
                    (v_adicional->>'quantidade')::INTEGER * (v_adicional->>'preco')::NUMERIC
                );
            END LOOP;
        END IF;
    END LOOP;
    
    -- Retornar resultado
    RETURN json_build_object(
        'pedido_id', v_pedido_id,
        'numero_pedido', v_numero_pedido,
        'total', p_total,
        'status', 'analise'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao criar pedido: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;