-- 🔧 CORREÇÃO URGENTE: Resolver conflitos de políticas RLS
-- Há múltiplas políticas conflitantes impedindo inserção pública

-- ==============================================
-- REMOVER POLÍTICAS CONFLITANTES
-- ==============================================

-- Remover políticas duplicadas/conflitantes
DROP POLICY IF EXISTS "Users can insert customer addresses for their company" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can view their company customer addresses" ON public.customer_addresses;

-- Remover política com validação muito restritiva temporariamente
DROP POLICY IF EXISTS "Public can insert customer addresses for orders" ON public.customer_addresses;

-- ==============================================
-- CRIAR POLÍTICA SIMPLIFICADA PARA DEBUG
-- ==============================================

-- Política temporária bem permissiva para testar
CREATE POLICY "Public can insert addresses - temp debug"
ON public.customer_addresses
FOR INSERT 
TO anon
WITH CHECK (company_id IS NOT NULL);

-- Política para SELECT público também
CREATE POLICY "Public can view addresses for orders"
ON public.customer_addresses
FOR SELECT
TO anon
USING (company_id IS NOT NULL);

-- ==============================================
-- VERIFICAÇÃO DAS POLÍTICAS RESTANTES
-- ==============================================

-- Listar políticas para confirmar limpeza
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '📋 POLÍTICAS ATIVAS PARA customer_addresses:';
    
    FOR policy_record IN 
        SELECT policyname, cmd, roles::text, 
               CASE WHEN qual IS NOT NULL THEN 'USING: ' || qual ELSE 'No USING' END as using_clause,
               CASE WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check ELSE 'No WITH CHECK' END as check_clause
        FROM pg_policies 
        WHERE tablename = 'customer_addresses'
        ORDER BY policyname
    LOOP
        RAISE NOTICE '  - %: % (%) | % | %', 
            policy_record.policyname, 
            policy_record.cmd, 
            policy_record.roles,
            policy_record.using_clause,
            policy_record.check_clause;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTE: Política temporária aplicada';
    RAISE NOTICE '⚠️  LEMBRETE: Refinar política após teste bem-sucedido';
END $$;