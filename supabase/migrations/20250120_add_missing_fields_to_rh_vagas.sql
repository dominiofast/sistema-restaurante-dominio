-- Adicionar campos faltantes à tabela rh_vagas
ALTER TABLE public.rh_vagas 
ADD COLUMN salary_range TEXT,
ADD COLUMN requirements TEXT,
ADD COLUMN benefits TEXT;

-- Atualizar o timestamp da tabela
UPDATE public.rh_vagas SET updated_at = NOW() WHERE updated_at IS NULL; 