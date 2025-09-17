-- Corrigir a função para trabalhar com os tipos corretos das tabelas
CREATE OR REPLACE FUNCTION public.criar_pedido_pdv_completo(
    p_company_id uuid, 
    p_nome text, 
    p_telefone text, 
    p_itens text, 
    p_endereco text DEFAULT NULL::text, 
    p_tipo text DEFAULT 'balcao'::text, 
    p_pagamento text DEFAULT NULL::text, 
    p_total numeric DEFAULT 0, 
    p_observacoes text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pedido_id INTEGER;  -- INTEGER não UUID!
    v_numero_pedido INTEGER;
    v_item JSON;
    v_item_id UUID;
    v_adicional JSON;
    v_itens_array JSON[];
    v_produto_uuid UUID;
    v_produto_id_str TEXT;
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
    
    -- Inserir pedido principal (id é INTEGER auto-incremento)
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
        
        -- Tratar produto_id - pode ser UUID ou um ID que precisa ser convertido
        v_produto_id_str := v_item->>'produto_id';
        
        -- Tentar converter para UUID diretamente
        BEGIN
            v_produto_uuid := v_produto_id_str::UUID;
        EXCEPTION
            WHEN invalid_text_representation THEN
                -- Se não é um UUID válido, buscar produto pelo ID se for numérico
                IF v_produto_id_str ~ '^[0-9]+$' THEN
                    -- É um número, vamos buscar na tabela produtos pelo name ou criar um UUID temporário
                    -- Para manter compatibilidade, vamos usar um UUID baseado no ID
                    v_produto_uuid := ('00000000-0000-0000-0000-' || lpad(v_produto_id_str, 12, '0'))::UUID;
                ELSE
                    RAISE EXCEPTION 'ID do produto inválido: %', v_produto_id_str;
                END IF;
        END;
        
        -- Inserir item (pedido_id é INTEGER, produto_id é UUID)
        INSERT INTO public.pedido_itens (
            pedido_id,
            produto_id,
            nome_produto,
            quantidade,
            valor_unitario,
            valor_total
        ) VALUES (
            v_pedido_id,  -- INTEGER
            v_produto_uuid,  -- UUID
            v_item->>'nome_produto',
            (v_item->>'quantidade')::INTEGER,
            (v_item->>'preco_unitario')::NUMERIC,
            (v_item->>'quantidade')::INTEGER * (v_item->>'preco_unitario')::NUMERIC
        ) RETURNING id INTO v_item_id;
        
        -- Inserir adicionais se existirem
        IF v_item->'adicionais' IS NOT NULL AND json_array_length(v_item->'adicionais') > 0 THEN
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
$$;