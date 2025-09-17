-- Adicionar política para permitir leitura pública do cashback de clientes
-- Isso é necessário para o cardápio público poder verificar o saldo de cashback

CREATE POLICY "Public can view customer cashback" 
ON public.customer_cashback 
FOR SELECT 
USING (true);