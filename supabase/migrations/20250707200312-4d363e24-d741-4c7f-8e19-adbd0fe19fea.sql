-- Corrigir políticas RLS para ifood_integrations com abordagem mais simples
DROP POLICY IF EXISTS "Super admins can manage all ifood integrations" ON ifood_integrations;
DROP POLICY IF EXISTS "Users can view their company ifood integrations" ON ifood_integrations;

-- Política simplificada - permitir acesso para usuários autenticados
CREATE POLICY "Allow authenticated users to view ifood integrations"
ON ifood_integrations
FOR SELECT
TO authenticated
USING (true);

-- Política para super admins gerenciarem tudo
CREATE POLICY "Allow super admins to manage ifood integrations"
ON ifood_integrations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'super_admin'
  )
);