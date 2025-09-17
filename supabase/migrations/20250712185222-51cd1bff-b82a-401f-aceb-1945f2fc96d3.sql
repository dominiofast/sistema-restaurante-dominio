-- Criar uma política mais simples para printer_configs que funcione com o contexto atual
DROP POLICY IF EXISTS "Users can manage their company printer configs" ON printer_configs;

-- Criar nova política que permite ao usuário autenticado gerenciar configurações de impressora
-- baseando-se no company_id passado e verificando se o usuário tem acesso a essa empresa
CREATE POLICY "Allow authenticated users to manage printer configs" 
ON printer_configs FOR ALL 
TO authenticated 
USING (
  -- Verificar se o usuário tem acesso à empresa através da função can_access_company
  can_access_company(company_id)
) 
WITH CHECK (
  -- Verificar se o usuário tem acesso à empresa através da função can_access_company
  can_access_company(company_id)
);