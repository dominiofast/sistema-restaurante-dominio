-- Corrigir colunas com varchar(20) que podem causar erro ao atualizar pedidos
-- Estas tabelas são afetadas pelos triggers de notificação e cashback

-- Tabela ai_conversation_logs (usada para notificações WhatsApp)
ALTER TABLE public.ai_conversation_logs 
ALTER COLUMN customer_phone TYPE VARCHAR(50),
ALTER COLUMN message_type TYPE VARCHAR(50);

-- Tabela cashback_transactions (usada pelo trigger de cashback)
ALTER TABLE public.cashback_transactions 
ALTER COLUMN customer_phone TYPE VARCHAR(50),
ALTER COLUMN tipo TYPE VARCHAR(50);

-- Tabela customer_cashback (usada pelo trigger de cashback)
ALTER TABLE public.customer_cashback 
ALTER COLUMN customer_phone TYPE VARCHAR(50);

-- Outras tabelas que podem estar sendo atualizadas
ALTER TABLE public.caixas 
ALTER COLUMN status TYPE VARCHAR(50);

ALTER TABLE public.clientes 
ALTER COLUMN status TYPE VARCHAR(50);

ALTER TABLE public.print_queue 
ALTER COLUMN status TYPE VARCHAR(50),
ALTER COLUMN type TYPE VARCHAR(50);

ALTER TABLE public.nfce_logs 
ALTER COLUMN status TYPE VARCHAR(50);