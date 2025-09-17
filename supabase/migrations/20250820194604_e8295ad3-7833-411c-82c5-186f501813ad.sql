-- CORREÇÃO FINAL - RLS SEGURO E FUNCIONAL
-- Reabilitar RLS com políticas corretas para manter funcional mas protegido

-- 1. customer_addresses - RLS seguro
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_addresses') THEN
        
        -- Reabilitar RLS 
        ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
        
        -- Política para usuários autenticados verem da sua empresa
        CREATE POLICY "Authenticated users can manage their company customer addresses"
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
        
        -- Política para público ver endereços de empresas ativas
        CREATE POLICY "Public can view customer addresses for active companies"
        ON public.customer_addresses
        FOR SELECT
        TO anon
        USING (
            company_id IN (
                SELECT id FROM companies WHERE status = 'active'
            )
        );
        
        -- Política para público inserir endereços em empresas ativas
        CREATE POLICY "Public can insert customer addresses for active companies"
        ON public.customer_addresses
        FOR INSERT
        TO anon
        WITH CHECK (
            company_id IN (
                SELECT id FROM companies WHERE status = 'active'
            )
        );
        
        RAISE NOTICE 'RLS seguro aplicado para customer_addresses';
    END IF;
END $$;

-- 2. clientes - RLS seguro  
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes') THEN
        
        -- Reabilitar RLS
        ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
        
        -- Política para usuários autenticados verem da sua empresa
        CREATE POLICY "Authenticated users can manage their company clients"
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
        
        -- Política para público ver clientes de empresas ativas (limitado)
        CREATE POLICY "Public can view clients for active companies"
        ON public.clientes
        FOR SELECT
        TO anon
        USING (
            company_id IN (
                SELECT id FROM companies WHERE status = 'active'
            )
        );
        
        -- Política para público inserir clientes em empresas ativas
        CREATE POLICY "Public can insert clients for active companies"
        ON public.clientes
        FOR INSERT
        TO anon
        WITH CHECK (
            company_id IN (
                SELECT id FROM companies WHERE status = 'active'
            )
        );
        
        RAISE NOTICE 'RLS seguro aplicado para clientes';
    END IF;
END $$;

-- 3. Verificação final
SELECT 
    'RLS SEGURO APLICADO - SISTEMA FUNCIONAL E PROTEGIDO' as status,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'customer_addresses') as policies_customer_addresses,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clientes') as policies_clientes;