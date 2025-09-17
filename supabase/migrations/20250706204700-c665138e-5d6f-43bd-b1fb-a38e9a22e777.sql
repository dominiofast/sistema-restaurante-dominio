-- Remover políticas RLS antigas da tabela print_configs
DROP POLICY IF EXISTS "Users can view their company print configs" ON public.print_configs;
DROP POLICY IF EXISTS "Users can insert their company print configs" ON public.print_configs;
DROP POLICY IF EXISTS "Users can update their company print configs" ON public.print_configs;

-- Criar políticas RLS mais robustas
CREATE POLICY "Allow users to view their company print configs" 
  ON public.print_configs 
  FOR SELECT 
  USING (can_access_company(company_id));

CREATE POLICY "Allow users to insert their company print configs" 
  ON public.print_configs 
  FOR INSERT 
  WITH CHECK (can_access_company(company_id));

CREATE POLICY "Allow users to update their company print configs" 
  ON public.print_configs 
  FOR UPDATE 
  USING (can_access_company(company_id))
  WITH CHECK (can_access_company(company_id));

CREATE POLICY "Allow users to delete their company print configs" 
  ON public.print_configs 
  FOR DELETE 
  USING (can_access_company(company_id));