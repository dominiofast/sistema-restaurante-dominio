-- Política para permitir upload de arquivos no bucket media
-- Política para leitura pública dos arquivos
CREATE POLICY "Allow public read access" ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'media');

-- Política para upload de arquivos autenticados
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Política para update de arquivos autenticados  
CREATE POLICY "Allow authenticated users to update files" ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Política para delete de arquivos autenticados
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'media');