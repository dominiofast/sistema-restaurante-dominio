-- Adicionar campo cnae_principal à tabela company_fiscal_config
ALTER TABLE public.company_fiscal_config 
ADD COLUMN cnae_principal text;