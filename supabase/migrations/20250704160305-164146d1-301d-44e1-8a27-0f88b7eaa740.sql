-- Permitir execução pública da função get_next_pedido_number_for_company_today
-- Necessário para que clientes não autenticados possam fazer pedidos

-- Recriar a função com SECURITY DEFINER para permitir execução pública
CREATE OR REPLACE FUNCTION public.get_next_pedido_number_for_company_today(company_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER -- Permite execução com privilégios elevados
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
    
    -- Verificar se a sequência existe, se não, criar
    BEGIN
        EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
    EXCEPTION 
        WHEN undefined_table THEN
            -- Criar a sequência se não existir
            EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
            EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
    END;
    
    RETURN next_number;
END;
$$;

-- Permitir execução pública da função
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today(UUID) TO authenticated;