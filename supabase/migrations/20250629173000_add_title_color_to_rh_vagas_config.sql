-- Adiciona a coluna title_color à tabela rh_vagas_config
ALTER TABLE public.rh_vagas_config
ADD COLUMN title_color VARCHAR(7) DEFAULT '#FFFFFF';

-- Adiciona um comentário à nova coluna para maior clareza
COMMENT ON COLUMN public.rh_vagas_config.title_color IS 'Armazena o código de cor hexadecimal para o título na página pública de vagas.';
