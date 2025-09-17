-- Permitir que usuários anônimos insiram transações de cashback no cardápio público
-- Isso é necessário para o cardápio público poder aplicar cashback

CREATE POLICY "Public can create cashback transactions" 
ON public.cashback_transactions 
FOR INSERT 
WITH CHECK (
    company_id IS NOT NULL 
    AND customer_phone IS NOT NULL 
    AND tipo IN ('credito', 'debito')
);