-- Aumentar o tamanho da coluna chave_nfe para suportar chaves maiores
ALTER TABLE public.nfce_logs 
ALTER COLUMN chave_nfe TYPE VARCHAR(50);