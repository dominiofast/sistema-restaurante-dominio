-- Remover todas as políticas atuais
DROP POLICY IF EXISTS "Public can insert customer addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Authenticated users can view customer addresses of their company" ON public.customer_addresses;
DROP POLICY IF EXISTS "Authenticated users can update customer addresses of their company" ON public.customer_addresses;
DROP POLICY IF EXISTS "Authenticated users can delete customer addresses of their company" ON public.customer_addresses;

-- Criar políticas que permitem acesso público para inserção e leitura (necessário para cardápio público)
-- Mas mantém controle de acesso para updates/deletes apenas para usuários autenticados

CREATE POLICY "Public can insert customer addresses" 
ON public.customer_addresses 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Public can view customer addresses" 
ON public.customer_addresses 
FOR SELECT 
TO public
USING (true);

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