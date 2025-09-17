-- ==========================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA RLS - Parte 3
-- Dropar função com dependências e recriar políticas seguras
-- ==========================================

-- Dropar função e todas as dependências
DROP FUNCTION IF EXISTS public.can_access_company(uuid) CASCADE;

-- Recriar função para verificar se usuário pode acessar empresa
CREATE OR REPLACE FUNCTION public.can_access_company(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT 
    get_user_role() = 'super_admin' OR
    company_uuid::text = ANY(get_user_companies()) OR
    company_uuid IN (
      SELECT id FROM companies 
      WHERE domain = get_user_company_domain()
    );
$$;

-- Recriar as políticas que foram removidas (usando as funções seguras)
CREATE POLICY "Users can access payment config for their company" 
ON public.payment_delivery_config 
FOR ALL 
TO authenticated 
USING (can_access_company(company_id))
WITH CHECK (can_access_company(company_id));

CREATE POLICY "Users can access card brands for their company" 
ON public.payment_delivery_card_brands 
FOR ALL 
TO authenticated 
USING (can_access_company(company_id))
WITH CHECK (can_access_company(company_id));

CREATE POLICY "Allow authenticated users to manage printer configs" 
ON public.printer_configs 
FOR ALL 
TO authenticated 
USING (can_access_company(company_id))
WITH CHECK (can_access_company(company_id));