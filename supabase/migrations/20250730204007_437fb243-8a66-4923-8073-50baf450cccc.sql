-- Verificar e recriar políticas para o bucket programas
DROP POLICY IF EXISTS "Authenticated users can upload programs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view programs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete programs" ON storage.objects;

-- Criar novas políticas mais permissivas
CREATE POLICY "Anyone can upload to programs bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'programas');

CREATE POLICY "Anyone can view programs bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'programas');

CREATE POLICY "Anyone can update programs bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'programas');

CREATE POLICY "Anyone can delete from programs bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'programas');