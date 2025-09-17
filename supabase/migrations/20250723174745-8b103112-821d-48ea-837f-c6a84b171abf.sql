-- Corrigir função para evitar erro de sequência já existe
CREATE OR REPLACE FUNCTION public.get_next_pedido_number_by_turno(company_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sequence_name TEXT;
    next_number INTEGER;
    turno_id UUID;
    turno_numero INTEGER;
    today_date TEXT;
    sequence_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se há turno ativo
    SELECT get_active_turno_for_company(company_uuid) INTO turno_id;
    
    IF turno_id IS NOT NULL THEN
        -- Usar numeração por turno
        SELECT numero_turno INTO turno_numero FROM public.turnos WHERE id = turno_id;
        
        today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
        sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_turno_' || turno_numero || '_' || today_date || '_seq';
        
        -- Verificar se a sequência do turno existe
        SELECT EXISTS (
            SELECT 1 FROM pg_sequences 
            WHERE sequencename = sequence_name AND schemaname = 'public'
        ) INTO sequence_exists;
        
        IF sequence_exists THEN
            -- Sequência existe, usar próximo valor
            EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
        ELSE
            -- Sequência não existe, criar com tratamento de erro
            BEGIN
                EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
                EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
            EXCEPTION
                WHEN duplicate_table THEN
                    -- Se a sequência já existe (criada concorrentemente), apenas usar ela
                    EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
            END;
        END IF;
    ELSE
        -- Se não há turno ativo, usar numeração diária como fallback
        today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
        sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_' || today_date || '_seq';
        
        SELECT EXISTS (
            SELECT 1 FROM pg_sequences 
            WHERE sequencename = sequence_name AND schemaname = 'public'
        ) INTO sequence_exists;
        
        IF sequence_exists THEN
            -- Sequência existe, usar próximo valor
            EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
        ELSE
            -- Sequência não existe, criar com tratamento de erro
            BEGIN
                EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
                EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
            EXCEPTION
                WHEN duplicate_table THEN
                    -- Se a sequência já existe (criada concorrentemente), apenas usar ela
                    EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
            END;
        END IF;
    END IF;
    
    RETURN next_number;
END;
$$;