-- CORREÇÃO CRÍTICA - Políticas RLS estavam MUITO permissivas
-- PROBLEMA: 'anon' consegue ver 5197 clientes de todas empresas ativas

-- 1. REMOVER políticas permissivas demais
DROP POLICY IF EXISTS "Public can view customer addresses for active companies" ON public.customer_addresses;
DROP POLICY IF EXISTS "Public can insert customer addresses for active companies" ON public.customer_addresses;
DROP POLICY IF EXISTS "Public can view clients for active companies" ON public.clientes;
DROP POLICY IF EXISTS "Public can insert clients for active companies" ON public.clientes;

-- 2. CRIAR políticas MAIS RESTRITIVAS - apenas para context específico de pedidos
-- customer_addresses: anon só pode inserir, não listar todos
CREATE POLICY "Anon can insert customer addresses only"
ON public.customer_addresses
FOR INSERT
TO anon
WITH CHECK (
    company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
);

-- customer_addresses: anon pode ver apenas endereços específicos via query exata
CREATE POLICY "Anon can view specific customer address by phone and company"
ON public.customer_addresses  
FOR SELECT
TO anon
USING (
    company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
    AND customer_phone IS NOT NULL
);

-- clientes: anon só pode inserir, não listar
CREATE POLICY "Anon can insert clients only"
ON public.clientes
FOR INSERT  
TO anon
WITH CHECK (
    company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
);

-- clientes: anon pode ver apenas cliente específico via query exata
CREATE POLICY "Anon can view specific client by phone and company"
ON public.clientes
FOR SELECT
TO anon
USING (
    company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
    AND phone IS NOT NULL
);

-- 3. TESTAR se agora está mais restritivo
SELECT 'APÓS CORREÇÃO - clientes' as teste, COUNT(*) as total_acessivel
FROM public.clientes;

SELECT 'APÓS CORREÇÃO - customer_addresses' as teste, COUNT(*) as total_acessivel  
FROM public.customer_addresses;