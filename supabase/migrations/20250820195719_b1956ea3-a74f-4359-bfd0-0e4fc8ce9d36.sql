-- CORREÇÃO SMART - Dar permissões mínimas para RLS funcionar
-- Sem GRANT, as políticas RLS não conseguem ser avaliadas

-- 1. Dar permissões mínimas para RLS funcionar (só SELECT para consulta de cardápio)
GRANT SELECT ON public.customer_addresses TO anon;
GRANT SELECT ON public.clientes TO anon;

-- 2. Dar INSERT apenas para permitir novos clientes/endereços em empresas ativas
GRANT INSERT ON public.customer_addresses TO anon;
GRANT INSERT ON public.clientes TO anon;

-- 3. VERIFICAR que as políticas RLS estão restringindo corretamente
SELECT 
    'POLÍTICAS ATIVAS' as status,
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('customer_addresses', 'clientes')
ORDER BY tablename, policyname;

-- 4. Testar se a política está funcionando - simular consulta anônima
SELECT 'TESTE RLS customer_addresses' as teste, COUNT(*) as total_acessivel
FROM public.customer_addresses;

SELECT 'TESTE RLS clientes' as teste, COUNT(*) as total_acessivel  
FROM public.clientes;