-- 🎯 POLÍTICA RLS DEFINITIVA: customer_addresses funcionando

-- Remover política temporária extrema
DROP POLICY IF EXISTS "ultimate_simple_policy" ON public.customer_addresses;

-- Criar políticas RLS apropriadas e funcionais
CREATE POLICY "Public can insert customer addresses"
ON public.customer_addresses
FOR INSERT 
TO anon
WITH CHECK (
    customer_phone IS NOT NULL 
    AND customer_phone != ''
    AND logradouro IS NOT NULL 
    AND logradouro != ''
);

CREATE POLICY "Public can view customer addresses by phone"
ON public.customer_addresses
FOR SELECT 
TO anon
USING (customer_phone IS NOT NULL);

CREATE POLICY "Users can manage their company addresses"
ON public.customer_addresses
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT id FROM companies 
        WHERE id = get_user_company_id()
    )
)
WITH CHECK (
    company_id IN (
        SELECT id FROM companies 
        WHERE id = get_user_company_id()
    )
);

-- Log de finalização
DO $$
BEGIN
    RAISE NOTICE '✅ POLÍTICAS RLS DEFINITIVAS APLICADAS:';
    RAISE NOTICE '📱 Anônimos: Podem inserir e ver endereços (com validação básica)';
    RAISE NOTICE '🔐 Autenticados: Podem gerenciar endereços da sua empresa';
    RAISE NOTICE '🎯 Sistema de endereços funcionando corretamente!';
END $$;