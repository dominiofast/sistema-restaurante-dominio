-- Remover política existente que pode estar conflitando
DROP POLICY IF EXISTS "Public can delete customer addresses for cardapio" ON public.customer_addresses;

-- Criar nova política mais específica para exclusão no cardápio público
CREATE POLICY "Anon delete customer addresses for cardapio" 
ON public.customer_addresses 
FOR DELETE 
TO anon
USING (
  -- Permitir delete para usuários anônimos se:
  -- 1. Company ID existe e empresa está ativa
  company_id IS NOT NULL
  AND company_id IN (
    SELECT id FROM companies WHERE status = 'active'
  )
  -- 2. Endereço tem telefone do cliente (validação básica)
  AND customer_phone IS NOT NULL
  AND customer_phone != ''
);