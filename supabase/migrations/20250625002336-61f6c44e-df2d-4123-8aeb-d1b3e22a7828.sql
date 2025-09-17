
-- Adicionar coluna origem na tabela pedidos
ALTER TABLE public.pedidos 
ADD COLUMN origem VARCHAR(50) DEFAULT 'pdv';
