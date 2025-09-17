-- Temporariamente simplificar as políticas para debug
DROP POLICY IF EXISTS "Users can view their company print configs" ON print_configs;
DROP POLICY IF EXISTS "Users can create their company print configs" ON print_configs;
DROP POLICY IF EXISTS "Users can update their company print configs" ON print_configs;
DROP POLICY IF EXISTS "Users can delete their company print configs" ON print_configs;

-- Política temporária mais simples para debug
CREATE POLICY "Temporary full access to print configs" 
ON print_configs 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);