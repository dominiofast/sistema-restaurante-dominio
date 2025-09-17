-- Forçar reset completo da sequência de hoje
-- Remover completamente e recriar do zero

-- Dropar a sequência atual de hoje
DROP SEQUENCE IF EXISTS public.pedidos_550e8400_e29b_41d4_a716_446655440001_2025_07_04_seq;

-- Recriar função que força a criação limpa da sequência
CREATE OR REPLACE FUNCTION public.get_next_pedido_number_for_company_today(company_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sequence_name TEXT;
    next_number INTEGER;
    today_date TEXT;
BEGIN
    -- Data de hoje no formato YYYY-MM-DD
    today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
    
    -- Nome da sequência específica para esta empresa hoje
    sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_' || today_date || '_seq';
    
    -- SEMPRE dropar e recriar a sequência para garantir que comece do 1
    BEGIN
        EXECUTE format('DROP SEQUENCE IF EXISTS %I', sequence_name);
        EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
        EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
        
        RAISE NOTICE 'Sequência recriada: % - Número gerado: %', sequence_name, next_number;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Erro ao criar sequência: %', SQLERRM;
    END;
    
    RETURN next_number;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today(UUID) TO authenticated;