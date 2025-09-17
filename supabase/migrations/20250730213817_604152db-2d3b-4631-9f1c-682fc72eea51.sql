-- Remove o limite de tamanho específico para usar o limite global do Supabase
-- O Supabase tem um limite global padrão que é maior que 200MB
UPDATE storage.buckets 
SET file_size_limit = NULL 
WHERE name = 'programas';