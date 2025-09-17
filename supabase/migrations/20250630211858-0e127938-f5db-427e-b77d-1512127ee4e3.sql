
-- Adicionar campos de requisitos e benefícios à tabela rh_vagas
ALTER TABLE rh_vagas 
ADD COLUMN requirements TEXT,
ADD COLUMN benefits TEXT,
ADD COLUMN salary_range TEXT;

-- Atualizar o timestamp da tabela
UPDATE rh_vagas SET updated_at = NOW() WHERE updated_at IS NULL;
