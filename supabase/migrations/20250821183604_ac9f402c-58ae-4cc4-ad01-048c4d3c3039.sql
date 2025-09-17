-- INVESTIGANDO O QUE QUEBROU O REAL-TIME
-- Verificar se as tabelas estão configuradas corretamente para real-time

-- 1. Garantir que as tabelas estão na publicação do real-time
SELECT 'Tables in realtime publication:' as info;
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- 2. Verificar se REPLICA IDENTITY está configurado
SELECT 'Replica identity status:' as info;
SELECT c.relname, c.relreplident FROM pg_class c WHERE c.relname IN ('whatsapp_messages', 'whatsapp_chats');

-- 3. Reconfigurar REPLICA IDENTITY FULL para as tabelas
ALTER TABLE whatsapp_messages REPLICA IDENTITY FULL;
ALTER TABLE whatsapp_chats REPLICA IDENTITY FULL;

-- 4. Verificar se estão na publicação (deve mostrar as tabelas)
SELECT 'After configuration:' as info;  
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';