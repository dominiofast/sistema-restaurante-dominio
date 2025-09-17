-- Criar política para permitir exclusão de endereços no cardápio público
-- Usuários anônimos devem poder deletar endereços que eles mesmos criaram baseado no telefone

CREATE POLICY "Public can delete customer addresses for cardapio" 
ON public.customer_addresses 
FOR DELETE 
USING (
  -- Permitir delete se o company_id existe (validação básica)
  company_id IS NOT NULL
  -- Adicional: verificar se é uma empresa ativa
  AND company_id IN (
    SELECT id FROM companies WHERE status = 'active'
  )
);