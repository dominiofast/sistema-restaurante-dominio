-- CORREÇÃO CRÍTICA - Remover permissões diretas que anulam RLS
-- O problema: mesmo com RLS, o 'anon' tem GRANT SELECT direto

-- 1. Remover permissões diretas de SELECT para anon
REVOKE SELECT ON public.customer_addresses FROM anon;
REVOKE SELECT ON public.clientes FROM anon;

-- 2. Remover permissões de INSERT também para maior segurança  
REVOKE INSERT ON public.customer_addresses FROM anon;
REVOKE INSERT ON public.clientes FROM anon;

-- 3. Verificar se ainda há permissões perigosas
SELECT 
    'APÓS REVOKE - customer_addresses' as status,
    has_table_privilege('anon', 'customer_addresses', 'SELECT') as can_select_after,
    has_table_privilege('anon', 'customer_addresses', 'INSERT') as can_insert_after
    
UNION ALL

SELECT 
    'APÓS REVOKE - clientes' as status,
    has_table_privilege('anon', 'clientes', 'SELECT') as can_select_after,
    has_table_privilege('anon', 'clientes', 'INSERT') as can_insert_after;

-- 4. Confirmar que RLS ainda está ativo
SELECT 
    'RLS STATUS FINAL' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('customer_addresses', 'clientes');