-- Add missing columns to clientes table
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS total_pedidos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dias_sem_comprar INTEGER DEFAULT 0;