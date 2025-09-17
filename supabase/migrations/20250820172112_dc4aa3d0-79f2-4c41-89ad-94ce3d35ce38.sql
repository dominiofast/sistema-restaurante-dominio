-- 🔧 SIMPLIFICAR POLÍTICA: Testar validações uma por uma

-- Remover política atual que ainda está causando problema
DROP POLICY IF EXISTS "Allow public address insertion for orders" ON public.customer_addresses;

-- Política SUPER SIMPLES - apenas company_id obrigatório
CREATE POLICY "Simple public insert - only company_id required"
ON public.customer_addresses
FOR INSERT 
TO anon
WITH CHECK (company_id IS NOT NULL);

DO $$
BEGIN
    RAISE NOTICE '🧪 POLÍTICA ULTRA SIMPLES ATIVADA';
    RAISE NOTICE '📋 Validação: Apenas company_id IS NOT NULL';
    RAISE NOTICE '🔄 TESTE: Salvar endereço agora';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Se funcionar → adicionar validações gradualmente';
    RAISE NOTICE '🎯 Se não funcionar → company_id pode estar NULL/inválido';
END $$;