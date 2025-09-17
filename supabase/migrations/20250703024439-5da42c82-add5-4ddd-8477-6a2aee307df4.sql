-- Adicionar campo inscricao_estadual na tabela company_info
ALTER TABLE company_info ADD COLUMN IF NOT EXISTS inscricao_estadual character varying;