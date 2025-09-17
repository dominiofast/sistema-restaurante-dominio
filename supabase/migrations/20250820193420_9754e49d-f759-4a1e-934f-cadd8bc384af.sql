-- CORREÇÃO CONSERVADORA - Proteger apenas tabelas confirmadas

-- 1. Proteger backup de endereços de clientes (CRÍTICO) - sem assumir estrutura
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_addresses_backup') THEN
        ALTER TABLE public.customer_addresses_backup ENABLE ROW LEVEL SECURITY;
        
        -- Revogar acesso público imediatamente
        REVOKE ALL ON public.customer_addresses_backup FROM anon;
        
        -- Política super restritiva: apenas super admins
        CREATE POLICY "Only super admins can access address backups" ON public.customer_addresses_backup
            FOR ALL USING (
                get_user_role() = 'super_admin'
            );
    END IF;
END $$;

-- 2. Proteger dados de cashback (se existir com company_id)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'customer_cashback' 
        AND column_name = 'company_id'
    ) THEN
        ALTER TABLE public.customer_cashback ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Company users can manage their customer cashback" ON public.customer_cashback
            FOR ALL USING (
                company_id IN (
                    SELECT uc.company_id FROM user_companies uc
                    WHERE uc.user_id = auth.uid()
                    AND uc.is_active = true
                )
            );
    END IF;
END $$;

-- 3. Corrigir search_path em funções que sabemos que existem
DO $$
BEGIN
    -- Verificar e corrigir função por função
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'trigger_recalcular_custo') THEN
        ALTER FUNCTION public.trigger_recalcular_custo() SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'recalcular_custo_receita') THEN
        ALTER FUNCTION public.recalcular_custo_receita(uuid) SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'sync_pedido_to_parent') THEN
        ALTER FUNCTION public.sync_pedido_to_parent() SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'set_numero_pedido') THEN
        ALTER FUNCTION public.set_numero_pedido() SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'get_next_pedido_number_by_turno') THEN
        ALTER FUNCTION public.get_next_pedido_number_by_turno(uuid) SET search_path = 'public', 'pg_temp';
    END IF;
END $$;

-- 4. Proteger logs de sistema (sem assumir company_id)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_logs') THEN
        ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
        
        -- Revogar acesso público
        REVOKE ALL ON public.notification_logs FROM anon;
        
        -- Política simples: apenas usuários autenticados podem ler
        CREATE POLICY "Authenticated users can read notification logs" ON public.notification_logs
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 5. Proteger fila de notificações (sem assumir company_id)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_queue') THEN
        ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
        
        -- Revogar acesso público
        REVOKE ALL ON public.notification_queue FROM anon;
        
        -- Política: apenas usuários autenticados podem gerenciar
        CREATE POLICY "Authenticated users can manage notification queue" ON public.notification_queue
            FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 6. Melhorar política de sessões de autoatendimento
DROP POLICY IF EXISTS "Users can manage their own sessions by token" ON public.autoatendimento_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.autoatendimento_sessions;

-- Política mais restritiva para sessões
CREATE POLICY "Active sessions only" ON public.autoatendimento_sessions
    FOR ALL USING (
        timeout_at > now()  -- Apenas sessões ativas
        OR auth.uid() IS NOT NULL  -- Ou usuários autenticados
    );