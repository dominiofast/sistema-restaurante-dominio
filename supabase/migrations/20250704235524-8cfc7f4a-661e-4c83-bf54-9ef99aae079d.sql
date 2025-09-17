-- Remover política existente inadequada
DROP POLICY IF EXISTS "Users can manage their company print configs" ON print_configs;

-- Criar políticas RLS adequadas para print_configs
CREATE POLICY "Users can view their company print configs" 
ON print_configs 
FOR SELECT 
USING (can_access_company(company_id));

CREATE POLICY "Users can create their company print configs" 
ON print_configs 
FOR INSERT 
WITH CHECK (can_access_company(company_id));

CREATE POLICY "Users can update their company print configs" 
ON print_configs 
FOR UPDATE 
USING (can_access_company(company_id))
WITH CHECK (can_access_company(company_id));

CREATE POLICY "Users can delete their company print configs" 
ON print_configs 
FOR DELETE 
USING (can_access_company(company_id));