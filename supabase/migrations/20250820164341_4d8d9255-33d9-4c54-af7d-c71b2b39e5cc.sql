-- 🔧 CORREÇÃO: Permitir salvamento de endereços durante pedidos públicos
-- O cardápio público precisa poder salvar endereços de clientes durante o processo de pedido

-- ==============================================
-- CUSTOMER_ADDRESSES - ADICIONAR POLÍTICA PÚBLICA PARA PEDIDOS
-- ==============================================

-- Criar política para permitir inserção pública de endereços durante pedidos
-- Mas apenas com dados mínimos necessários
CREATE POLICY "Public can insert customer addresses for orders"
ON public.customer_addresses
FOR INSERT 
TO anon
WITH CHECK (
  -- Permitir apenas se todos os campos obrigatórios estão preenchidos
  customer_name IS NOT NULL 
  AND customer_phone IS NOT NULL 
  AND company_id IS NOT NULL
  AND logradouro IS NOT NULL
  AND cidade IS NOT NULL
);

-- ==============================================
-- DELIVERY_METHODS - VERIFICAR E CORRIGIR POLÍTICAS
-- ==============================================

-- Remover políticas problemáticas se existirem
DROP POLICY IF EXISTS "Public cannot access delivery_methods" ON public.delivery_methods;

-- Criar política para permitir leitura pública dos métodos de entrega
CREATE POLICY "Public can view delivery methods"
ON public.delivery_methods
FOR SELECT
TO anon
USING (true);

-- Política para usuários autenticados gerenciarem seus métodos
CREATE POLICY "Company users can manage delivery methods"
ON public.delivery_methods
FOR ALL
TO authenticated
USING (company_id = get_user_company_id())
WITH CHECK (company_id = get_user_company_id());

-- ==============================================
-- FUNÇÃO PARA BUSCA SEGURA DE ENDEREÇOS PÚBLICOS
-- ==============================================

-- Criar função pública para buscar endereços por telefone (apenas dados necessários para pedido)
CREATE OR REPLACE FUNCTION public.get_customer_addresses_for_order(
  p_phone TEXT,
  p_company_id UUID
)
RETURNS TABLE (
  id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validar parâmetros
  IF p_phone IS NULL OR p_company_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Limpar telefone
  p_phone := regexp_replace(p_phone, '[^0-9]', '', 'g');
  
  -- Buscar endereços do cliente para a empresa
  RETURN QUERY
  SELECT 
    ca.id,
    ca.customer_name,
    ca.customer_phone,
    ca.logradouro,
    ca.numero,
    ca.complemento,
    ca.bairro,
    ca.cidade,
    ca.estado,
    ca.cep
  FROM public.customer_addresses ca
  WHERE ca.company_id = p_company_id
    AND regexp_replace(ca.customer_phone, '[^0-9]', '', 'g') = p_phone
  ORDER BY ca.created_at DESC
  LIMIT 5;
END;
$$;

-- Permitir uso público da função
GRANT EXECUTE ON FUNCTION public.get_customer_addresses_for_order(TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_customer_addresses_for_order(TEXT, UUID) TO authenticated;

-- ==============================================
-- VERIFICAÇÃO E LOG
-- ==============================================

DO $$
BEGIN
  RAISE NOTICE '🔧 CORREÇÃO: Cardápio público corrigido';
  RAISE NOTICE '✅ Política pública para inserção de endereços criada';
  RAISE NOTICE '✅ Políticas de delivery_methods corrigidas';
  RAISE NOTICE '✅ Função de busca de endereços para pedidos criada';
  RAISE NOTICE '';
  RAISE NOTICE '📋 O cardápio público agora pode:';
  RAISE NOTICE '- Salvar endereços durante pedidos';
  RAISE NOTICE '- Visualizar métodos de entrega';
  RAISE NOTICE '- Buscar endereços existentes por telefone';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Segurança mantida:';
  RAISE NOTICE '- Apenas dados essenciais expostos';
  RAISE NOTICE '- Validação de campos obrigatórios';
  RAISE NOTICE '- Busca restrita por empresa';
END $$;