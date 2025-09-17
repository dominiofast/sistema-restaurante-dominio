-- 🔒 APLICAR POLÍTICAS SEGURAS: Agora que testamos, vamos aplicar políticas apropriadas

-- ==============================================
-- REMOVER POLÍTICAS TEMPORÁRIAS DE DEBUG
-- ==============================================

DROP POLICY IF EXISTS "temp_public_insert_debug" ON public.customer_addresses;
DROP POLICY IF EXISTS "temp_public_select_debug" ON public.customer_addresses;

-- ==============================================
-- APLICAR POLÍTICAS SEGURAS E FUNCIONAIS
-- ==============================================

-- Política para inserção pública (com validação mínima necessária)
CREATE POLICY "Public can save addresses during orders"
ON public.customer_addresses
FOR INSERT 
TO anon
WITH CHECK (
  company_id IS NOT NULL 
  AND customer_phone IS NOT NULL 
  AND logradouro IS NOT NULL
);

-- Política para busca pública limitada (apenas via função RPC)
CREATE POLICY "Public can view addresses via RPC only"
ON public.customer_addresses
FOR SELECT
TO anon
USING (false); -- Força uso da função RPC que criamos

-- ==============================================
-- VERIFICAÇÃO FINAL
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '✅ CUSTOMER_ADDRESSES: Políticas seguras aplicadas';
    RAISE NOTICE '📋 Inserção pública: Permitida com validação';
    RAISE NOTICE '🔍 Busca pública: Apenas via função RPC segura';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PRÓXIMO PROBLEMA CRÍTICO: Credenciais Expostas';
    RAISE NOTICE '⚠️  TABLES COM CREDENCIAIS SENSÍVEIS EXPOSTAS:';
    RAISE NOTICE '   - company_credentials (senhas, tokens)';
    RAISE NOTICE '   - asaas_config (chaves API pagamento)';
    RAISE NOTICE '   - mercado_pago_config (credenciais MP)';
    RAISE NOTICE '   - whatsapp_integrations (tokens WhatsApp)';
END $$;