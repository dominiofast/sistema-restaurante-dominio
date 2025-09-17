-- Adicionar colunas ausentes na tabela dados_fiscais para completar a implementação

-- Campos ICMS que estão faltando
ALTER TABLE public.dados_fiscais 
ADD COLUMN IF NOT EXISTS icms_situacao_tributaria character varying DEFAULT '102',
ADD COLUMN IF NOT EXISTS icms_origem character varying DEFAULT '0',
ADD COLUMN IF NOT EXISTS icms_reducao_base numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS icms_st_reducao_base numeric DEFAULT 0.00;

-- Campos PIS/COFINS que estão faltando  
ALTER TABLE public.dados_fiscais
ADD COLUMN IF NOT EXISTS pis_situacao_tributaria character varying DEFAULT '07',
ADD COLUMN IF NOT EXISTS pis_base_calculo numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cofins_situacao_tributaria character varying DEFAULT '07',
ADD COLUMN IF NOT EXISTS cofins_base_calculo numeric DEFAULT 0.00;

-- Campos IPI que estão faltando
ALTER TABLE public.dados_fiscais
ADD COLUMN IF NOT EXISTS ipi_situacao_tributaria character varying DEFAULT '53',
ADD COLUMN IF NOT EXISTS ipi_codigo_enquadramento character varying DEFAULT '999';

-- Campos CEST e observações que estão faltando
ALTER TABLE public.dados_fiscais
ADD COLUMN IF NOT EXISTS cest character varying,
ADD COLUMN IF NOT EXISTS observacoes text,
ADD COLUMN IF NOT EXISTS cfop character varying DEFAULT '5102';