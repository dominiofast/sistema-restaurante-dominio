-- Corrigir função para manter sequência durante o dia mas resetar diariamente
CREATE OR REPLACE FUNCTION public.get_next_pedido_number_for_company_today(company_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sequence_name TEXT;
    next_number INTEGER;
    today_date TEXT;
    sequence_exists BOOLEAN := FALSE;
BEGIN
    -- Data de hoje no formato YYYY-MM-DD
    today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
    
    -- Nome da sequência específica para esta empresa hoje
    sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_' || today_date || '_seq';
    
    -- Verificar se a sequência já existe
    SELECT EXISTS (
        SELECT 1 FROM pg_sequences 
        WHERE sequencename = sequence_name AND schemaname = 'public'
    ) INTO sequence_exists;
    
    IF sequence_exists THEN
        -- Sequência existe, usar próximo valor
        EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
        RAISE NOTICE 'Usando sequência existente: % - Número: %', sequence_name, next_number;
    ELSE
        -- Sequência não existe, criar começando do 1
        EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
        EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
        RAISE NOTICE 'Nova sequência criada: % - Primeiro pedido: %', sequence_name, next_number;
    END IF;
    
    RETURN next_number;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today(UUID) TO authenticated;