-- CORREÇÃO DE POLÍTICAS RLS PARA CUSTOMER_ADDRESSES
-- Problema: Políticas muito restritivas impedem consultas legítimas

-- 1. Verificar se a tabela existe e remover políticas restritivas
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_addresses') THEN
        
        -- Remover políticas restritivas existentes
        DROP POLICY IF EXISTS "Restrict customer_addresses access" ON public.customer_addresses;
        DROP POLICY IF EXISTS "Only authenticated users can view customer addresses" ON public.customer_addresses;
        DROP POLICY IF EXISTS "Company users can view customer addresses" ON public.customer_addresses;
        
        -- Revogar acesso restritivo anterior
        REVOKE ALL ON public.customer_addresses FROM anon;
        REVOKE ALL ON public.customer_addresses FROM authenticated;
        
        -- Garantir que RLS está habilitado
        ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
        
        -- Política para usuários autenticados da empresa
        CREATE POLICY "Company users can manage customer addresses" ON public.customer_addresses
            FOR ALL 
            TO authenticated
            USING (
                company_id IN (
                    SELECT uc.company_id 
                    FROM user_companies uc 
                    WHERE uc.user_id = auth.uid() 
                    AND uc.is_active = true
                )
            )
            WITH CHECK (
                company_id IN (
                    SELECT uc.company_id 
                    FROM user_companies uc 
                    WHERE uc.user_id = auth.uid() 
                    AND uc.is_active = true
                )
            );
        
        -- Política para consultas públicas limitadas (cardápio digital, etc)
        CREATE POLICY "Public can view customer addresses for active companies" ON public.customer_addresses
            FOR SELECT 
            TO public
            USING (
                company_id IN (
                    SELECT id FROM companies 
                    WHERE status = 'active'
                )
                AND customer_phone IS NOT NULL
            );
            
        -- Política para inserção de novos endereços via sistema público
        CREATE POLICY "Public can insert customer addresses" ON public.customer_addresses
            FOR INSERT 
            TO public
            WITH CHECK (
                company_id IN (
                    SELECT id FROM companies 
                    WHERE status = 'active'
                )
                AND customer_phone IS NOT NULL
                AND customer_name IS NOT NULL
            );
        
        -- Dar permissões básicas necessárias
        GRANT SELECT, INSERT ON public.customer_addresses TO authenticated;
        GRANT SELECT, INSERT ON public.customer_addresses TO anon;
        
        RAISE NOTICE 'Políticas RLS corrigidas para customer_addresses';
    ELSE
        RAISE NOTICE 'Tabela customer_addresses não encontrada';
    END IF;
END $$;

-- 2. Corrigir também a tabela clientes se necessário
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes') THEN
        
        -- Remover políticas muito restritivas
        DROP POLICY IF EXISTS "Restrict clientes access" ON public.clientes;
        DROP POLICY IF EXISTS "Only authenticated users can view clientes" ON public.clientes;
        
        -- Política para usuários da empresa
        DROP POLICY IF EXISTS "Company users can manage clientes" ON public.clientes;
        CREATE POLICY "Company users can manage clientes" ON public.clientes
            FOR ALL 
            TO authenticated
            USING (
                company_id IN (
                    SELECT uc.company_id 
                    FROM user_companies uc 
                    WHERE uc.user_id = auth.uid() 
                    AND uc.is_active = true
                )
            );
        
        -- Política para consultas públicas
        DROP POLICY IF EXISTS "Public can view clientes for active companies" ON public.clientes;
        CREATE POLICY "Public can view clientes for active companies" ON public.clientes
            FOR SELECT 
            TO public
            USING (
                company_id IN (
                    SELECT id FROM companies 
                    WHERE status = 'active'
                )
                AND phone IS NOT NULL
            );
        
        -- Política para inserção pública
        DROP POLICY IF EXISTS "Public can insert clientes" ON public.clientes;
        CREATE POLICY "Public can insert clientes" ON public.clientes
            FOR INSERT 
            TO public
            WITH CHECK (
                company_id IN (
                    SELECT id FROM companies 
                    WHERE status = 'active'
                )
                AND phone IS NOT NULL
            );
        
        GRANT SELECT, INSERT ON public.clientes TO authenticated;
        GRANT SELECT, INSERT ON public.clientes TO anon;
        
        RAISE NOTICE 'Políticas RLS corrigidas para clientes';
    END IF;
END $$;