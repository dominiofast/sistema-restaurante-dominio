-- Remover política muito restritiva
DROP POLICY IF EXISTS "Users can manage their company branding" ON cardapio_branding;

-- Criar política que permite super admins terem acesso total
CREATE POLICY "Super admins can manage all branding" ON cardapio_branding
FOR ALL TO authenticated
USING (
  -- Super admins podem acessar tudo
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
)
WITH CHECK (
  -- Super admins podem criar/modificar tudo
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Criar política para usuários normais gerenciarem apenas sua empresa
CREATE POLICY "Users can manage their company branding" ON cardapio_branding
FOR ALL TO authenticated
USING (
  -- Usuários normais só podem acessar sua empresa
  auth.uid() IS NOT NULL AND 
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
)
WITH CHECK (
  -- Usuários normais só podem criar/modificar para sua empresa
  auth.uid() IS NOT NULL AND 
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);