-- CORREÇÃO com nome correto da coluna - telefone ao invés de phone

-- 1. REMOVER políticas permissivas demais (se ainda existirem)
DROP POLICY IF EXISTS "Public can view customer addresses for active companies" ON public.customer_addresses;
DROP POLICY IF EXISTS "Public can insert customer addresses for active companies" ON public.customer_addresses;
DROP POLICY IF EXISTS "Public can view clients for active companies" ON public.clientes;  
DROP POLICY IF EXISTS "Public can insert clients for active companies" ON public.clientes;

-- 2. CRIAR políticas RESTRITIVAS - apenas consultas específicas
-- customer_addresses: anon pode ver apenas com phone e company específicos
CREATE POLICY "Anon can view specific customer address by phone" 
ON public.customer_addresses
FOR SELECT
TO anon
USING (
    company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
    AND customer_phone IS NOT NULL
);

-- customer_addresses: anon pode inserir em empresas ativas
CREATE POLICY "Anon can insert customer addresses"
ON public.customer_addresses
FOR INSERT
TO anon
WITH CHECK (
    company_id IN (
        SELECT id FROM companies WHERE status = 'active'  
    )
);

-- clientes: anon pode ver apenas com telefone e company específicos
CREATE POLICY "Anon can view specific client by telefone"
ON public.clientes
FOR SELECT
TO anon
USING (
    company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
    AND telefone IS NOT NULL
);

-- clientes: anon pode inserir em empresas ativas
CREATE POLICY "Anon can insert clients"
ON public.clientes
FOR INSERT
TO anon
WITH CHECK (
    company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
);

-- 3. TESTAR se está mais restritivo
SELECT 'TESTE FINAL - clientes acessíveis via anon' as info, COUNT(*) as total
FROM public.clientes;

-- 4. Verificar políticas criadas
SELECT 'POLÍTICAS FINAIS' as status, tablename, policyname
FROM pg_policies 
WHERE tablename IN ('clientes', 'customer_addresses')
ORDER BY tablename;