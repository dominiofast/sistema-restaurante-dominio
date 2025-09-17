-- 🔒 CORREÇÃO DEFINITIVA: Reabilitar RLS e criar políticas funcionais

-- ==============================================
-- REABILITAR RLS IMEDIATAMENTE
-- ==============================================

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- REMOVER POLÍTICA DEBUG
-- ==============================================

DROP POLICY IF EXISTS "Debug - super permissive public insert" ON public.customer_addresses;

-- ==============================================
-- CRIAR POLÍTICAS FUNCIONAIS E SEGURAS
-- ==============================================

-- Política para inserção pública durante pedidos (funcional e segura)
CREATE POLICY "Allow public address insertion for orders"
ON public.customer_addresses
FOR INSERT 
TO anon
WITH CHECK (
  -- Validações mínimas necessárias
  company_id IS NOT NULL 
  AND customer_phone IS NOT NULL
  AND length(trim(customer_phone)) >= 10
  AND logradouro IS NOT NULL
  AND length(trim(logradouro)) >= 5
);

-- Política para leitura via RPC (força uso da função segura)
CREATE POLICY "Allow public read via RPC function only"
ON public.customer_addresses
FOR SELECT
TO anon
USING (false); -- Força uso da função RPC que criamos

-- ==============================================
-- VERIFICAÇÃO FINAL
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '✅ CUSTOMER_ADDRESSES: RLS reabilitado com políticas funcionais';
    RAISE NOTICE '🔒 Inserção pública: Permitida com validações mínimas';
    RAISE NOTICE '📋 Validações aplicadas:';
    RAISE NOTICE '  - company_id obrigatório';
    RAISE NOTICE '  - telefone com mín. 10 dígitos';
    RAISE NOTICE '  - logradouro com mín. 5 caracteres';
    RAISE NOTICE '🔍 Leitura pública: Apenas via função RPC segura';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTE: Salvar endereço novamente para confirmar';
    RAISE NOTICE '🎯 Se funcionar → problema resolvido definitivamente';
END $$;