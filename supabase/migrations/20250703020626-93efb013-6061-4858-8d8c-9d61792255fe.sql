-- Remover políticas existentes muito restritivas
DROP POLICY IF EXISTS "Users can create their company fiscal config" ON company_fiscal_config;
DROP POLICY IF EXISTS "Users can update their company fiscal config" ON company_fiscal_config;
DROP POLICY IF EXISTS "Users can view their company fiscal config" ON company_fiscal_config;

-- Criar políticas mais simples e funcionais
CREATE POLICY "Enable all operations for authenticated users on fiscal config" 
ON company_fiscal_config 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Política especial para super admins
CREATE POLICY "Super admins can manage all fiscal configs" 
ON company_fiscal_config 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data ->> 'role') = 'super_admin'
  )
);