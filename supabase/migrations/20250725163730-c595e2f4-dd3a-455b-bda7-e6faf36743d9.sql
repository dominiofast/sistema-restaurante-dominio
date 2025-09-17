-- Remover políticas RLS existentes para delivery_methods
DROP POLICY IF EXISTS "Users can view their company delivery methods" ON delivery_methods;
DROP POLICY IF EXISTS "Users can insert their company delivery methods" ON delivery_methods;
DROP POLICY IF EXISTS "Users can update their company delivery methods" ON delivery_methods;
DROP POLICY IF EXISTS "Users can delete their company delivery methods" ON delivery_methods;

-- Criar políticas RLS mais simples para delivery_methods
CREATE POLICY "Allow authenticated users to manage delivery methods" 
ON delivery_methods 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);