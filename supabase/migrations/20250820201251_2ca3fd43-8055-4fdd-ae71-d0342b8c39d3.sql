-- APLICAR as mesmas correções para customer_addresses

-- 1. Remover política problemática se existir
DROP POLICY IF EXISTS "Auth users view their company addresses" ON public.customer_addresses;

-- 2. Criar políticas atualizadas usando as funções helper
CREATE POLICY "Company users can view their company addresses"
ON public.customer_addresses
FOR SELECT
TO authenticated
USING (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

CREATE POLICY "Company users can insert their company addresses"
ON public.customer_addresses
FOR INSERT
TO authenticated
WITH CHECK (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

CREATE POLICY "Company users can update their company addresses"
ON public.customer_addresses
FOR UPDATE
TO authenticated
USING (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
)
WITH CHECK (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

-- 3. Limpeza de políticas duplicadas se existirem
DROP POLICY IF EXISTS "Auth users delete their company addresses" ON public.customer_addresses;

CREATE POLICY "Company users can delete their company addresses"
ON public.customer_addresses
FOR DELETE
TO authenticated
USING (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

-- 4. Verificar estado final
SELECT 'POLÍTICAS CUSTOMER_ADDRESSES CORRIGIDAS' as status, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'customer_addresses'
ORDER BY policyname;