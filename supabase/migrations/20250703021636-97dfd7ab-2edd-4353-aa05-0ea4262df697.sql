-- Remover todas as políticas da tabela company_fiscal_config
DROP POLICY IF EXISTS "Enable all operations for authenticated users on fiscal config" ON company_fiscal_config;
DROP POLICY IF EXISTS "Super admins can manage all fiscal configs" ON company_fiscal_config;

-- Criar política muito simples que não acessa outras tabelas
CREATE POLICY "Allow all operations for authenticated users" 
ON company_fiscal_config 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);