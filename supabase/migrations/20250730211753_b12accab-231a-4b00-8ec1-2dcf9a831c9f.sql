-- Corrigir políticas do bucket 'programas' para permitir uploads

-- Remover política restritiva de upload
DROP POLICY IF EXISTS "Super admins can upload programas files" ON storage.objects;

-- Criar política mais permissiva para upload
CREATE POLICY "Authenticated users can upload programas files" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'programas' 
  AND auth.role() = 'authenticated'
);

-- Atualizar política de delete para ser mais restritiva
DROP POLICY IF EXISTS "Super admins can delete programas files" ON storage.objects;

CREATE POLICY "Authenticated users can delete programas files" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'programas' 
  AND auth.role() = 'authenticated'
);

-- Manter política de visualização pública
-- A política "Public can view programas files" já existe e está correta