-- Corrigir políticas RLS da tabela ifood_integrations
DROP POLICY IF EXISTS "Super admins can manage all ifood integrations" ON ifood_integrations;
DROP POLICY IF EXISTS "Users can view their company ifood integrations" ON ifood_integrations;

-- Política simplificada para super admins
CREATE POLICY "Super admins can manage all ifood integrations"
ON ifood_integrations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'super_admin'
  )
);

-- Política para usuários normais visualizarem suas lojas
CREATE POLICY "Users can view their company ifood integrations"
ON ifood_integrations
FOR SELECT
TO authenticated
USING (
  -- Super admin pode ver tudo
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'super_admin'
  )
  OR
  -- Usuários normais só veem lojas da sua empresa
  company_id IN (
    SELECT c.id FROM companies c
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
    WHERE u.id = auth.uid()
  )
);