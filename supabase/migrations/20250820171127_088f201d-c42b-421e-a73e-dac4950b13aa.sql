-- 🔧 DEBUG: Política super permissiva para identificar o problema

-- Remover política atual que pode ter validação problemática
DROP POLICY IF EXISTS "Public can save addresses during orders" ON public.customer_addresses;

-- Criar política completamente permissiva para debug
CREATE POLICY "Debug - super permissive public insert"
ON public.customer_addresses
FOR INSERT 
TO anon
WITH CHECK (true);

-- Verificar dados que estão tentando ser inseridos
DO $$
BEGIN
    RAISE NOTICE '🧪 POLÍTICA DEBUG ATIVADA';
    RAISE NOTICE '⚠️  ATENÇÃO: Política completamente permissiva!';
    RAISE NOTICE '🔄 Testar inserção agora para identificar problema';
    RAISE NOTICE '';
    RAISE NOTICE '📊 VALIDAÇÕES REMOVIDAS TEMPORARIAMENTE:';
    RAISE NOTICE '  - company_id pode ser NULL';
    RAISE NOTICE '  - customer_phone pode ser NULL';
    RAISE NOTICE '  - logradouro pode ser NULL';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 OBJETIVO: Identificar se problema é validação ou outra coisa';
END $$;