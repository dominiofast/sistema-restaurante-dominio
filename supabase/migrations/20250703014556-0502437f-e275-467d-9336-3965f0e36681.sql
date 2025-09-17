-- Adicionar novos campos à tabela company_info
ALTER TABLE public.company_info 
ADD COLUMN IF NOT EXISTS telefone2 character varying,
ADD COLUMN IF NOT EXISTS cep character varying,
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS numero character varying,
ADD COLUMN IF NOT EXISTS complemento character varying,
ADD COLUMN IF NOT EXISTS bairro character varying,
ADD COLUMN IF NOT EXISTS cidade character varying,
ADD COLUMN IF NOT EXISTS estado character varying,
ADD COLUMN IF NOT EXISTS cnae character varying;