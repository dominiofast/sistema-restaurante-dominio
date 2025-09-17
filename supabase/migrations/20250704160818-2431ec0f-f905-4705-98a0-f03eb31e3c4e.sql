-- Corrigir numeração diária dos pedidos
-- Remover sequências antigas e garantir que cada dia comece do 1

-- Função para resetar sequências diárias para começar do 1
CREATE OR REPLACE FUNCTION public.reset_daily_sequence_for_company(company_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sequence_name TEXT;
    today_date TEXT;
BEGIN
    -- Data de hoje no formato YYYY-MM-DD
    today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
    
    -- Nome da sequência específica para esta empresa hoje
    sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_' || today_date || '_seq';
    
    -- Se a sequência existe, resetar para 1
    BEGIN
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', sequence_name);
        RAISE NOTICE 'Sequência % resetada para 1', sequence_name;
    EXCEPTION
        WHEN undefined_table THEN
            -- Sequência não existe, não fazer nada
            RAISE NOTICE 'Sequência % não existe ainda', sequence_name;
    END;
END;
$$;

-- Modificar função principal para garantir que sempre comece do 1 no primeiro pedido do dia
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
    ELSE
        -- Sequência não existe, criar começando do 1
        EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
        EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
        
        RAISE NOTICE 'Nova sequência criada: % - Primeiro pedido do dia: %', sequence_name, next_number;
    END IF;
    
    RETURN next_number;
END;
$$;

-- Resetar a sequência de hoje para começar do 1
-- Substitua o UUID pela empresa que está testando
DO $$
DECLARE
    company_id UUID := '550e8400-e29b-41d4-a716-446655440001'; -- UUID da empresa de teste
BEGIN
    PERFORM public.reset_daily_sequence_for_company(company_id);
END $$;

-- Garantir permissões para execução pública
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_daily_sequence_for_company(UUID) TO authenticated;