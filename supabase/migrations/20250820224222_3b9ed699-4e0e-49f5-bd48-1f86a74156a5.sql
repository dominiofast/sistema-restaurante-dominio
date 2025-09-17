-- Corrigir políticas RLS para cashback manual funcionar corretamente

-- Remover políticas antigas conflitantes
DROP POLICY IF EXISTS "Company users can manage their customer cashback" ON public.customer_cashback;
DROP POLICY IF EXISTS "Users can view their company customer cashback" ON public.customer_cashback;
DROP POLICY IF EXISTS "Users can insert their company customer cashback" ON public.customer_cashback;
DROP POLICY IF EXISTS "Users can update their company customer cashback" ON public.customer_cashback;

-- Políticas simplificadas para customer_cashback
CREATE POLICY "Authenticated users can view customer cashback" 
ON public.customer_cashback FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert customer cashback" 
ON public.customer_cashback FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update customer cashback" 
ON public.customer_cashback FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete customer cashback" 
ON public.customer_cashback FOR DELETE 
USING (auth.role() = 'authenticated');

-- Corrigir políticas para cashback_transactions também
DROP POLICY IF EXISTS "Users can view their company cashback transactions" ON public.cashback_transactions;
DROP POLICY IF EXISTS "Users can insert their company cashback transactions" ON public.cashback_transactions;

CREATE POLICY "Authenticated users can view cashback transactions" 
ON public.cashback_transactions FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cashback transactions" 
ON public.cashback_transactions FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');