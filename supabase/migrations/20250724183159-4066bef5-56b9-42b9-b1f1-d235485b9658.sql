-- Verificar e corrigir políticas RLS para user_companies
-- Remover políticas existentes e criar novas mais permissivas

DROP POLICY IF EXISTS "Super admins can manage user companies" ON user_companies;
DROP POLICY IF EXISTS "Users can view their own company associations" ON user_companies;
DROP POLICY IF EXISTS "Admins can manage users for their company" ON user_companies;

-- Política para super admins
CREATE POLICY "Super admins can manage all user companies" 
ON user_companies 
FOR ALL 
USING (get_user_role() = 'super_admin');

-- Política para permitir inserção via service role (edge functions)
CREATE POLICY "Service role can insert user companies" 
ON user_companies 
FOR INSERT 
WITH CHECK (true);

-- Política para usuários autenticados verem suas próprias associações
CREATE POLICY "Users can view their own company associations" 
ON user_companies 
FOR SELECT 
USING (user_id = auth.uid() OR get_user_role() = 'super_admin');

-- Política para admins gerenciarem usuários da sua empresa
CREATE POLICY "Company admins can manage users" 
ON user_companies 
FOR ALL 
USING (
  get_user_role() = 'super_admin' OR 
  company_id IN (
    SELECT uc.company_id 
    FROM user_companies uc 
    WHERE uc.user_id = auth.uid() 
    AND uc.role IN ('admin', 'super_admin')
  )
);