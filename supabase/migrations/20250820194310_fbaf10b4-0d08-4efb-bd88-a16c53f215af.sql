-- CORREÇÃO SIMPLES - Remover bloqueio total em customer_addresses e clientes

-- 1. Corrigir customer_addresses
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_addresses') THEN
        
        -- Remover todas as políticas existentes
        DROP POLICY IF EXISTS "Restrict customer_addresses access" ON public.customer_addresses;
        DROP POLICY IF EXISTS "Only authenticated users can view customer addresses" ON public.customer_addresses;
        DROP POLICY IF EXISTS "Company users can view customer addresses" ON public.customer_addresses;
        DROP POLICY IF EXISTS "Public can view customer addresses for active companies" ON public.customer_addresses;
        DROP POLICY IF EXISTS "Public can insert customer addresses" ON public.customer_addresses;
        DROP POLICY IF EXISTS "Company users can manage customer addresses" ON public.customer_addresses;
        
        -- Desabilitar RLS temporariamente para permitir acesso
        ALTER TABLE public.customer_addresses DISABLE ROW LEVEL SECURITY;
        
        -- Dar permissões básicas
        GRANT ALL ON public.customer_addresses TO authenticated;
        GRANT SELECT, INSERT ON public.customer_addresses TO anon;
        
        RAISE NOTICE 'RLS desabilitado temporariamente para customer_addresses';
    END IF;
END $$;

-- 2. Corrigir clientes 
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes') THEN
        
        -- Remover políticas restritivas
        DROP POLICY IF EXISTS "Restrict clientes access" ON public.clientes;
        DROP POLICY IF EXISTS "Only authenticated users can view clientes" ON public.clientes;
        DROP POLICY IF EXISTS "Company users can manage clientes" ON public.clientes;
        DROP POLICY IF EXISTS "Public can view clientes for active companies" ON public.clientes;
        DROP POLICY IF EXISTS "Public can insert clientes" ON public.clientes;
        
        -- Desabilitar RLS temporariamente
        ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
        
        -- Dar permissões básicas
        GRANT ALL ON public.clientes TO authenticated;
        GRANT SELECT, INSERT ON public.clientes TO anon;
        
        RAISE NOTICE 'RLS desabilitado temporariamente para clientes';
    END IF;
END $$;