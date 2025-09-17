-- Criar política para permitir upload no bucket media para usuários autenticados
CREATE POLICY "Media bucket upload policy" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Criar política para permitir leitura pública do bucket media
CREATE POLICY "Media bucket public read policy" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'media');

-- Criar política para permitir update no bucket media para usuários autenticados
CREATE POLICY "Media bucket update policy" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Criar política para permitir delete no bucket media para usuários autenticados
CREATE POLICY "Media bucket delete policy" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'media');