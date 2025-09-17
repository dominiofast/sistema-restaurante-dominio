-- CORREÇÃO SIMPLES: Apenas corrigir permissões da tabela customer_addresses
-- Problema: Políticas RLS muito restritivas

DO $$
BEGIN
    -- Verificar se a tabela customer_addresses existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_addresses') THEN
        
        -- Garantir que usuários anônimos e autenticados têm permissão para SELECT e INSERT
        GRANT SELECT, INSERT ON public.customer_addresses TO anon;
        GRANT SELECT, INSERT ON public.customer_addresses TO authenticated;
        
        -- Se não há políticas, criar uma política básica permissiva
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'customer_addresses'
        ) THEN
            -- Política permissiva para permitir operações necessárias
            CREATE POLICY "Allow customer addresses access" ON public.customer_addresses
                FOR ALL 
                TO public
                USING (true)
                WITH CHECK (true);
        END IF;
        
        RAISE NOTICE 'Permissões corrigidas para customer_addresses';
    END IF;
    
    -- Mesmo para clientes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes') THEN
        
        GRANT SELECT, INSERT ON public.clientes TO anon;
        GRANT SELECT, INSERT ON public.clientes TO authenticated;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'clientes'
        ) THEN
            CREATE POLICY "Allow clientes access" ON public.clientes
                FOR ALL 
                TO public
                USING (true)
                WITH CHECK (true);
        END IF;
        
        RAISE NOTICE 'Permissões corrigidas para clientes';
    END IF;
END $$;