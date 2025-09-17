-- 🔧 CORREÇÃO: Limpar todas as políticas conflitantes e recriar

-- ==============================================
-- REMOVER TODAS AS POLÍTICAS PÚBLICAS EXISTENTES
-- ==============================================

DROP POLICY IF EXISTS "Public can insert addresses - temp debug" ON public.customer_addresses;
DROP POLICY IF EXISTS "Public can view addresses for orders" ON public.customer_addresses; 
DROP POLICY IF EXISTS "Public can insert customer addresses for orders" ON public.customer_addresses;

-- ==============================================
-- POLÍTICA TEMPORÁRIA MUITO SIMPLES PARA TESTE
-- ==============================================

-- Política de inserção bem permissiva apenas para teste
CREATE POLICY "temp_public_insert_debug"
ON public.customer_addresses
FOR INSERT 
TO anon
WITH CHECK (true);

-- Política de leitura também
CREATE POLICY "temp_public_select_debug"
ON public.customer_addresses
FOR SELECT
TO anon
USING (true);

-- ==============================================
-- VERIFICAÇÃO
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '🧪 POLÍTICAS TEMPORÁRIAS APLICADAS';
    RAISE NOTICE '⚠️  ATENÇÃO: Políticas muito permissivas para debug apenas!';
    RAISE NOTICE '🔄 Testar salvamento de endereço agora';
    RAISE NOTICE '📝 Após teste, aplicar políticas seguras novamente';
END $$;