-- Remover políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view customer addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Authenticated users can insert customer addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Authenticated users can update customer addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Authenticated users can delete customer addresses" ON public.customer_addresses;

-- Criar políticas mais específicas usando a função can_access_customer_addresses
CREATE POLICY "Users can view customer addresses of their company" 
ON public.customer_addresses 
FOR SELECT 
USING (can_access_customer_addresses(company_id));

CREATE POLICY "Users can insert customer addresses for their company" 
ON public.customer_addresses 
FOR INSERT 
WITH CHECK (can_access_customer_addresses(company_id));

CREATE POLICY "Users can update customer addresses of their company" 
ON public.customer_addresses 
FOR UPDATE 
USING (can_access_customer_addresses(company_id))
WITH CHECK (can_access_customer_addresses(company_id));

CREATE POLICY "Users can delete customer addresses of their company" 
ON public.customer_addresses 
FOR DELETE 
USING (can_access_customer_addresses(company_id));