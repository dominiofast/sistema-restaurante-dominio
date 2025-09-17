-- Aumentar o tamanho da coluna status da tabela pedidos para suportar status maiores
ALTER TABLE public.pedidos 
ALTER COLUMN status TYPE VARCHAR(50);