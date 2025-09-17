-- Remover TODAS as políticas do bucket media para evitar conflitos
DROP POLICY IF EXISTS "Allow authenticated users full access to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read of media files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete media files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update media files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to media files" ON storage.objects;

-- Criar políticas simples e claras para o bucket media
CREATE POLICY "Media bucket - allow all for authenticated users" 
ON storage.objects 
FOR ALL 
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Media bucket - allow public read" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'media');