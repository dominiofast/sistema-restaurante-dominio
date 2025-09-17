-- Configurar limite de tamanho maior para o bucket 'programas'
-- 100MB = 104857600 bytes
UPDATE storage.buckets 
SET file_size_limit = 104857600 
WHERE name = 'programas';