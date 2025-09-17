-- Corrigir o erro de permissão na tabela users
-- Remover todas as políticas existentes na tabela ifood_integrations
DROP POLICY IF EXISTS "Allow authenticated users to view ifood integrations" ON ifood_integrations;
DROP POLICY IF EXISTS "Allow super admins to manage ifood integrations" ON ifood_integrations;
DROP POLICY IF EXISTS "Super admins can manage all ifood integrations" ON ifood_integrations;
DROP POLICY IF EXISTS "Users can view their company ifood integrations" ON ifood_integrations;

-- Criar política mais simples que não acessa auth.users
CREATE POLICY "Allow all authenticated to view ifood integrations"
ON ifood_integrations
FOR SELECT
TO authenticated
USING (true);

-- Criar política para INSERT/UPDATE/DELETE usando auth.jwt()
CREATE POLICY "Allow super admins full access to ifood integrations"
ON ifood_integrations
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
)
WITH CHECK (
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);