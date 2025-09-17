-- EXECUTE UMA QUERY POR VEZ NO SUPABASE
-- Copy cada linha separadamente

-- QUERY 1: Verificar se tabela WhatsApp existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%whatsapp%' 
AND table_schema = 'public';
