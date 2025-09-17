-- 🚨 TESTE EXTREMO: Desabilitar RLS temporariamente para identificar problema

-- Desabilitar RLS na tabela customer_addresses temporariamente
ALTER TABLE public.customer_addresses DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    RAISE NOTICE '⚠️  RLS DESABILITADO TEMPORARIAMENTE na customer_addresses';
    RAISE NOTICE '🧪 TESTE: Tentar salvar endereço agora';
    RAISE NOTICE '📋 Se funcionar → problema é política RLS';
    RAISE NOTICE '📋 Se não funcionar → problema é constraint/trigger/dados';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 AÇÃO: Testar salvamento de endereço';
    RAISE NOTICE '⏳ DEPOIS: Reabilitar RLS com política correta';
END $$;