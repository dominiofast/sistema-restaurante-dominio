
-- Verifica se a coluna title_color existe e adiciona se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'rh_vagas_config' 
        AND column_name = 'title_color'
    ) THEN
        ALTER TABLE public.rh_vagas_config
        ADD COLUMN title_color VARCHAR(7) DEFAULT '#FFFFFF';
        
        COMMENT ON COLUMN public.rh_vagas_config.title_color IS 'Armazena o código de cor hexadecimal para o título na página pública de vagas.';
    END IF;
END $$;
