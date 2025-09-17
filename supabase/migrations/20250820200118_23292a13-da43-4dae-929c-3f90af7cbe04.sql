-- LIMPEZA COMPLETA e RECRIAÇÃO das políticas RLS

-- 1. REMOVER TODAS as políticas existentes das tabelas críticas
DO $$
DECLARE 
    pol_record RECORD;
BEGIN
    -- Remover todas políticas de customer_addresses
    FOR pol_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'customer_addresses'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.customer_addresses', pol_record.policyname);
    END LOOP;
    
    -- Remover todas políticas de clientes
    FOR pol_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'clientes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.clientes', pol_record.policyname);
    END LOOP;
    
    RAISE NOTICE 'Políticas antigas removidas';
END $$;

-- 2. RECRIAR políticas SEGURAS

-- customer_addresses: Usuários autenticados veem da sua empresa
CREATE POLICY "Auth users view their company addresses"
ON public.customer_addresses
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() AND uc.is_active = true
    )
)
WITH CHECK (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() AND uc.is_active = true
    )
);

-- clientes: Usuários autenticados veem da sua empresa
CREATE POLICY "Auth users view their company clients" 
ON public.clientes
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() AND uc.is_active = true
    )
)
WITH CHECK (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() AND uc.is_active = true
    )
);

-- 3. TESTAR se não há acesso anônimo massivo
SELECT 'TESTE DE SEGURANÇA - anon' as teste, 
       (SELECT COUNT(*) FROM public.clientes) as clientes_visiveis,
       (SELECT COUNT(*) FROM public.customer_addresses) as enderecos_visiveis;

-- 4. Mostrar políticas finais
SELECT 'POLÍTICAS ATIVAS FINAIS' as status, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('clientes', 'customer_addresses')
ORDER BY tablename, policyname;