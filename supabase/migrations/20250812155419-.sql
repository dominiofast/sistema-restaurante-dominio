-- Habilitar realtime para a tabela pedidos
ALTER TABLE public.pedidos REPLICA IDENTITY FULL;

-- Adicionar a tabela à publication do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;