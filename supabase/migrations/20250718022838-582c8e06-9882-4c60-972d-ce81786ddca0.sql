-- Remover políticas existentes que exigem autenticação
DROP POLICY IF EXISTS "Users can view customer addresses of their company" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can insert customer addresses for their company" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can update customer addresses of their company" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can delete customer addresses of their company" ON public.customer_addresses;

-- Criar políticas que permitem acesso público para inserção (cardápio público) e acesso autenticado para visualização/edição
CREATE POLICY "Public can insert customer addresses" 
ON public.customer_addresses 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated users can view customer addresses of their company" 
ON public.customer_addresses 
FOR SELECT 
TO authenticated
USING (can_access_customer_addresses(company_id));

CREATE POLICY "Authenticated users can update customer addresses of their company" 
ON public.customer_addresses 
FOR UPDATE 
TO authenticated
USING (can_access_customer_addresses(company_id))
WITH CHECK (can_access_customer_addresses(company_id));

CREATE POLICY "Authenticated users can delete customer addresses of their company" 
ON public.customer_addresses 
FOR DELETE 
TO authenticated
USING (can_access_customer_addresses(company_id));