-- Corrigir as políticas RLS para usar o sistema de company_domain corretamente
-- E criar o usuário admin para a 300 Graus

-- Primeiro, vamos corrigir as políticas do cardapio_branding
DROP POLICY IF EXISTS "Users can insert branding for their company" ON cardapio_branding;
DROP POLICY IF EXISTS "Users can update branding of their company" ON cardapio_branding;
DROP POLICY IF EXISTS "Users can view branding of their company" ON cardapio_branding;

-- Criar políticas corretas que verificam o company_domain do usuário
CREATE POLICY "Users can insert branding for their company" ON cardapio_branding
FOR INSERT TO authenticated
WITH CHECK (
  company_id IN (
    SELECT c.id FROM companies c
    WHERE c.domain = (auth.jwt() -> 'user_metadata' ->> 'company_domain')
    OR c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
  )
  OR 
  -- Super admins podem acessar qualquer empresa
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

CREATE POLICY "Users can update branding of their company" ON cardapio_branding
FOR UPDATE TO authenticated
USING (
  company_id IN (
    SELECT c.id FROM companies c
    WHERE c.domain = (auth.jwt() -> 'user_metadata' ->> 'company_domain')
    OR c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
  )
  OR 
  -- Super admins podem acessar qualquer empresa
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

CREATE POLICY "Users can view branding of their company" ON cardapio_branding
FOR SELECT TO authenticated
USING (
  company_id IN (
    SELECT c.id FROM companies c
    WHERE c.domain = (auth.jwt() -> 'user_metadata' ->> 'company_domain')
    OR c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
  )
  OR 
  -- Super admins podem acessar qualquer empresa
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Verificar se existe usuário para 300graus, se não existir vamos precisar criar
SELECT 
  'Verificando usuários existentes' as status,
  email,
  raw_user_meta_data ->> 'company_domain' as company_domain
FROM auth.users 
WHERE raw_user_meta_data ->> 'company_domain' = '300graus';