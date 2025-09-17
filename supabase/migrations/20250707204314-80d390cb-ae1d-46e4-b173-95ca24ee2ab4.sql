-- Corrigir políticas RLS para ifood_app_config que causam erro "permission denied for table users"
DROP POLICY IF EXISTS "Super admins can create ifood app config" ON ifood_app_config;
DROP POLICY IF EXISTS "Super admins can update ifood app config" ON ifood_app_config;
DROP POLICY IF EXISTS "Super admins can delete ifood app config" ON ifood_app_config;
DROP POLICY IF EXISTS "Authenticated users can view ifood app config" ON ifood_app_config;

-- Criar políticas mais simples usando auth.jwt() ao invés de auth.users
CREATE POLICY "Super admins can manage ifood app config"
ON ifood_app_config
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
)
WITH CHECK (
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

CREATE POLICY "All authenticated users can view ifood app config"
ON ifood_app_config
FOR SELECT
TO authenticated
USING (true);