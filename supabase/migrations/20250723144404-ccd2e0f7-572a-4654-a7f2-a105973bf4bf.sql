-- Remover TODAS as políticas existentes da tabela cardapio_branding
DROP POLICY IF EXISTS "Super admins can manage all branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Users can manage their company branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Public can read active branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Super admins can manage branding" ON cardapio_branding;

-- Criar política unificada mais robusta
CREATE POLICY "Comprehensive branding access policy" ON cardapio_branding
FOR ALL TO authenticated
USING (
  -- Super admin tem acesso total (verifica múltiplos campos JWT)
  (
    (auth.jwt() ->> 'role') = 'super_admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin' OR
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
  )
  OR
  -- Usuários normais podem acessar apenas sua empresa
  (
    auth.uid() IS NOT NULL AND 
    company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
  )
)
WITH CHECK (
  -- Mesmas condições para CREATE/UPDATE
  (
    (auth.jwt() ->> 'role') = 'super_admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin' OR
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
  )
  OR
  (
    auth.uid() IS NOT NULL AND 
    company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
  )
);

-- Manter política pública para leitura de configurações ativas (para cardápio público)
CREATE POLICY "Public can read active branding" ON cardapio_branding
FOR SELECT TO anon
USING (is_active = true);