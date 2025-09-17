-- Função para corrigir order_position de produtos com valor 0
CREATE OR REPLACE FUNCTION fix_produtos_order_position()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    categoria_record RECORD;
    produto_record RECORD;
    position_counter INTEGER;
BEGIN
    -- Para cada categoria
    FOR categoria_record IN 
        SELECT DISTINCT categoria_id 
        FROM produtos 
        WHERE order_position = 0 OR order_position IS NULL
    LOOP
        position_counter := 1;
        
        -- Para cada produto desta categoria, ordenado por nome
        FOR produto_record IN 
            SELECT id 
            FROM produtos 
            WHERE categoria_id = categoria_record.categoria_id
            AND (order_position = 0 OR order_position IS NULL)
            ORDER BY name
        LOOP
            UPDATE produtos 
            SET order_position = position_counter 
            WHERE id = produto_record.id;
            
            position_counter := position_counter + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Posições dos produtos corrigidas com sucesso';
END;
$$;

-- Executar a correção imediatamente
SELECT fix_produtos_order_position();