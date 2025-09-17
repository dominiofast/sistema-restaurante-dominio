-- Forçar adição dos campos na tabela rh_vagas se não existirem
DO $$ 
BEGIN
    -- Verificar e adicionar salary_range
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rh_vagas' 
        AND column_name = 'salary_range'
    ) THEN
        ALTER TABLE public.rh_vagas ADD COLUMN salary_range TEXT;
        RAISE NOTICE 'Campo salary_range adicionado';
    ELSE
        RAISE NOTICE 'Campo salary_range já existe';
    END IF;
    
    -- Verificar e adicionar requirements
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rh_vagas' 
        AND column_name = 'requirements'
    ) THEN
        ALTER TABLE public.rh_vagas ADD COLUMN requirements TEXT;
        RAISE NOTICE 'Campo requirements adicionado';
    ELSE
        RAISE NOTICE 'Campo requirements já existe';
    END IF;
    
    -- Verificar e adicionar benefits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rh_vagas' 
        AND column_name = 'benefits'
    ) THEN
        ALTER TABLE public.rh_vagas ADD COLUMN benefits TEXT;
        RAISE NOTICE 'Campo benefits adicionado';
    ELSE
        RAISE NOTICE 'Campo benefits já existe';
    END IF;
END $$;

-- Forçar notificação para atualizar cache do PostgREST
SELECT pg_notify('pgrst', 'reload schema');

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'rh_vagas'
ORDER BY ordinal_position; 