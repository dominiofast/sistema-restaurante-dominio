-- 🔒 CORREÇÃO DE SEGURANÇA: Dados Pessoais de Clientes
-- Remover políticas perigosas e criar políticas seguras baseadas em empresa

-- ==============================================
-- TABELA CLIENTES - REMOVER POLÍTICAS PERIGOSAS
-- ==============================================

-- Remover políticas que expõem dados pessoais publicamente
DROP POLICY IF EXISTS "Users can view clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Public can view clients" ON public.clientes;
DROP POLICY IF EXISTS "Anon can view clients" ON public.clientes;

-- Criar políticas seguras para tabela clientes
CREATE POLICY "Company users can view their clients"
ON public.clientes
FOR SELECT
TO authenticated
USING (company_id = get_user_company_id());

CREATE POLICY "Company users can insert their clients"
ON public.clientes
FOR INSERT
TO authenticated
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company users can update their clients"
ON public.clientes
FOR UPDATE
TO authenticated
USING (company_id = get_user_company_id())
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company users can delete their clients"
ON public.clientes
FOR DELETE
TO authenticated
USING (company_id = get_user_company_id());

-- ==============================================
-- TABELA CUSTOMER_ADDRESSES - REMOVER POLÍTICAS PERIGOSAS
-- ==============================================

-- Remover políticas que expõem endereços publicamente
DROP POLICY IF EXISTS "Public can view customer addresses by phone" ON public.customer_addresses;
DROP POLICY IF EXISTS "Public can insert customer addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can view customer addresses" ON public.customer_addresses;

-- Criar políticas seguras para customer_addresses
CREATE POLICY "Company users can view their customer addresses"
ON public.customer_addresses
FOR SELECT
TO authenticated
USING (company_id = get_user_company_id());

CREATE POLICY "Company users can insert customer addresses"
ON public.customer_addresses
FOR INSERT
TO authenticated
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company users can update customer addresses"
ON public.customer_addresses
FOR UPDATE
TO authenticated
USING (company_id = get_user_company_id())
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company users can delete customer addresses"
ON public.customer_addresses
FOR DELETE
TO authenticated
USING (company_id = get_user_company_id());

-- ==============================================
-- FUNÇÃO DE BUSCA SEGURA POR TELEFONE
-- ==============================================

-- Criar função segura para busca de cliente por telefone (apenas dados mínimos)
CREATE OR REPLACE FUNCTION public.search_customer_by_phone(
  p_phone TEXT,
  p_company_id UUID
)
RETURNS TABLE (
  id INTEGER,
  nome CHARACTER VARYING,
  telefone CHARACTER VARYING
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validar que o telefone e company_id foram fornecidos
  IF p_phone IS NULL OR p_company_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Limpar telefone (remover caracteres especiais)
  p_phone := regexp_replace(p_phone, '[^0-9]', '', 'g');
  
  -- Buscar cliente apenas na empresa especificada
  RETURN QUERY
  SELECT 
    c.id,
    c.nome,
    c.telefone
  FROM public.clientes c
  WHERE c.company_id = p_company_id
    AND regexp_replace(c.telefone, '[^0-9]', '', 'g') = p_phone
    AND c.status = 'ativo'
  LIMIT 1;
END;
$$;

-- Permitir uso público da função de busca segura
GRANT EXECUTE ON FUNCTION public.search_customer_by_phone(TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.search_customer_by_phone(TEXT, UUID) TO authenticated;

-- ==============================================
-- VERIFICAÇÃO E LOG
-- ==============================================

DO $$
BEGIN
  RAISE NOTICE '🔒 SEGURANÇA: Dados de clientes protegidos';
  RAISE NOTICE '✅ Políticas públicas perigosas removidas de clientes e customer_addresses';
  RAISE NOTICE '✅ Políticas seguras baseadas em empresa criadas';
  RAISE NOTICE '✅ Função de busca segura por telefone criada';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Testar que usuários só veem dados de sua empresa';
  RAISE NOTICE '2. Validar funcionamento do cardápio público';
  RAISE NOTICE '3. Executar novo scan de segurança';
END $$;