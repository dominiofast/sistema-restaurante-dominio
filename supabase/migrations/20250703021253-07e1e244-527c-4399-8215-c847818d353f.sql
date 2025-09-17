-- Remover políticas complexas do storage certificados
DROP POLICY IF EXISTS "Empresas podem fazer upload de certificados" ON storage.objects;
DROP POLICY IF EXISTS "Empresas podem acessar seus certificados" ON storage.objects;
DROP POLICY IF EXISTS "Empresas podem atualizar seus certificados" ON storage.objects;
DROP POLICY IF EXISTS "Empresas podem deletar seus certificados" ON storage.objects;
DROP POLICY IF EXISTS "Super admins podem gerenciar todos os certificados" ON storage.objects;

-- Criar políticas mais simples para o bucket certificados
CREATE POLICY "Allow authenticated upload to certificados" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'certificados' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated read from certificados" ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'certificados' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated update in certificados" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'certificados' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated delete from certificados" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'certificados' 
  AND auth.uid() IS NOT NULL
);