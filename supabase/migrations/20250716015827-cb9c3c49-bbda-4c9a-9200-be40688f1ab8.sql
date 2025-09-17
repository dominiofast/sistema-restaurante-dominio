-- Corrigir políticas RLS da tabela customer_addresses para verificar acesso do usuário à empresa

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their company customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Users can insert their company customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Users can update their company customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Users can delete their company customer addresses" ON customer_addresses;

-- Criar políticas corretas que verificam se o usuário tem acesso à empresa
CREATE POLICY "Users can view their company customer addresses"
ON customer_addresses
FOR SELECT
TO authenticated
USING (
  -- Super admin pode ver tudo
  ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
  -- Admin de empresa pode ver endereços da sua empresa
  (company_id IN (
    SELECT c.id FROM companies c 
    WHERE c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
  ))
);

CREATE POLICY "Users can insert their company customer addresses"
ON customer_addresses
FOR INSERT
TO authenticated
WITH CHECK (
  -- Super admin pode inserir em qualquer empresa
  ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
  -- Admin de empresa pode inserir endereços na sua empresa
  (company_id IN (
    SELECT c.id FROM companies c 
    WHERE c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
  ))
);

CREATE POLICY "Users can update their company customer addresses"
ON customer_addresses
FOR UPDATE
TO authenticated
USING (
  -- Super admin pode atualizar tudo
  ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
  -- Admin de empresa pode atualizar endereços da sua empresa
  (company_id IN (
    SELECT c.id FROM companies c 
    WHERE c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
  ))
);

CREATE POLICY "Users can delete their company customer addresses"
ON customer_addresses
FOR DELETE
TO authenticated
USING (
  -- Super admin pode deletar tudo
  ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
  -- Admin de empresa pode deletar endereços da sua empresa
  (company_id IN (
    SELECT c.id FROM companies c 
    WHERE c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
  ))
);