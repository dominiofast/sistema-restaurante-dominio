-- Habilitar realtime para a tabela pedidos
ALTER TABLE public.pedidos REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação do realtime
BEGIN;
  -- Remover da publicação existente se já estiver
  DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
  
  -- Criar nova publicação incluindo pedidos
  CREATE PUBLICATION supabase_realtime FOR TABLE public.pedidos;
COMMIT;