-- Configurar replica identity para realtime funcionar corretamente
ALTER TABLE public.pedidos REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação do realtime se não estiver
INSERT INTO supabase_realtime.schema_publication (id, publication, schema) 
VALUES (gen_random_uuid(), 'supabase_realtime', 'public') 
ON CONFLICT DO NOTHING;

-- Garantir que a tabela pedidos está na publicação
INSERT INTO supabase_realtime.table_publication (id, publication, table_id, relations)
SELECT gen_random_uuid(), 'supabase_realtime', (SELECT id FROM supabase_realtime.schema_tables WHERE name = 'pedidos' AND schema = 'public'), '{}' 
WHERE NOT EXISTS (
  SELECT 1 FROM supabase_realtime.table_publication tp 
  JOIN supabase_realtime.schema_tables st ON tp.table_id = st.id 
  WHERE st.name = 'pedidos' AND st.schema = 'public'
);