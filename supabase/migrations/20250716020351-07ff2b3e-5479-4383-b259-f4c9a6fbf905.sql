-- Criar função security definer para verificar acesso à empresa
CREATE OR REPLACE FUNCTION public.can_access_customer_addresses(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      -- Super admin pode acessar qualquer empresa
      WHEN (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin' THEN TRUE
      -- Admin de empresa pode acessar apenas sua empresa
      WHEN EXISTS (
        SELECT 1 FROM public.companies 
        WHERE id = target_company_id 
        AND domain = (SELECT raw_user_meta_data->>'company_domain' FROM auth.users WHERE id = auth.uid())
      ) THEN TRUE
      ELSE FALSE
    END;
$$;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their company customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Users can insert their company customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Users can update their company customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Users can delete their company customer addresses" ON customer_addresses;

-- Criar políticas usando a função security definer
CREATE POLICY "Users can view their company customer addresses"
ON customer_addresses
FOR SELECT
TO authenticated
USING (public.can_access_customer_addresses(company_id));

CREATE POLICY "Users can insert their company customer addresses"
ON customer_addresses
FOR INSERT
TO authenticated
WITH CHECK (public.can_access_customer_addresses(company_id));

CREATE POLICY "Users can update their company customer addresses"
ON customer_addresses
FOR UPDATE
TO authenticated
USING (public.can_access_customer_addresses(company_id));

CREATE POLICY "Users can delete their company customer addresses"
ON customer_addresses
FOR DELETE
TO authenticated
USING (public.can_access_customer_addresses(company_id));