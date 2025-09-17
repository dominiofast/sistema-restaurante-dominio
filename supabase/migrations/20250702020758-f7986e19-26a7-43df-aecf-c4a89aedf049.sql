-- Atualizar políticas da tabela media_files para permitir super admins e admins multi-empresa

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view media files of their company" ON media_files;
DROP POLICY IF EXISTS "Users can insert media files for their company" ON media_files;
DROP POLICY IF EXISTS "Users can update media files of their company" ON media_files;
DROP POLICY IF EXISTS "Users can delete media files of their company" ON media_files;

-- Criar políticas mais flexíveis
CREATE POLICY "Allow media files access" ON media_files
FOR ALL 
USING (
  -- Super admin pode acessar tudo
  (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'))
  OR
  -- Admin pode acessar qualquer empresa (para multi-empresa)
  (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'))
  OR
  -- Usuário normal só pode acessar sua empresa
  (company_id IN (
    SELECT c.id FROM companies c 
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
    WHERE u.id = auth.uid()
  ))
)
WITH CHECK (
  -- Super admin pode inserir em qualquer empresa
  (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'))
  OR
  -- Admin pode inserir em qualquer empresa
  (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'))
  OR
  -- Usuário normal só pode inserir em sua empresa
  (company_id IN (
    SELECT c.id FROM companies c 
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
    WHERE u.id = auth.uid()
  ))
);