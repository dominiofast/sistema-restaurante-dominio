-- Aumentar o tamanho de outras colunas que podem estar limitadas
ALTER TABLE public.pedidos 
ALTER COLUMN telefone TYPE VARCHAR(50),
ALTER COLUMN horario TYPE VARCHAR(50),
ALTER COLUMN pagamento TYPE VARCHAR(50),
ALTER COLUMN tipo TYPE VARCHAR(50),
ALTER COLUMN origem TYPE VARCHAR(50);