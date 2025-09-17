-- Remover políticas existentes que podem estar em conflito
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;

-- Política mais específica para o bucket media
CREATE POLICY "Allow authenticated users full access to media bucket" 
ON storage.objects 
FOR ALL 
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Política para leitura pública
CREATE POLICY "Allow public read of media files" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'media');