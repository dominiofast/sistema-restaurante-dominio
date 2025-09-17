-- Configurar replica identity para realtime funcionar corretamente
ALTER TABLE public.pedidos REPLICA IDENTITY FULL;