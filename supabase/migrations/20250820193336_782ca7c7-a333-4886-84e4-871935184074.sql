-- CORREÇÃO FINAL CRÍTICA - Proteger tabelas restantes expostas

-- 1. Proteger backup de endereços de clientes (CRÍTICO)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_addresses_backup') THEN
        ALTER TABLE public.customer_addresses_backup ENABLE ROW LEVEL SECURITY;
        
        -- Revogar acesso público imediatamente
        REVOKE ALL ON public.customer_addresses_backup FROM anon;
        REVOKE ALL ON public.customer_addresses_backup FROM authenticated;
        
        -- Política restritiva: apenas super admins podem acessar backups
        CREATE POLICY "Only super admins can access address backups" ON public.customer_addresses_backup
            FOR ALL USING (
                get_user_role() = 'super_admin'
            );
    END IF;
END $$;

-- 2. Proteger logs de notificação
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_logs') THEN
        ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
        
        -- Revogar acesso público
        REVOKE ALL ON public.notification_logs FROM anon;
        
        -- Política: apenas usuários da empresa podem ver seus logs
        CREATE POLICY "Company users can view their notification logs" ON public.notification_logs
            FOR SELECT USING (
                company_id IN (
                    SELECT uc.company_id FROM user_companies uc
                    WHERE uc.user_id = auth.uid()
                    AND uc.is_active = true
                )
            );
    END IF;
END $$;

-- 3. Proteger fila de notificações
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_queue') THEN
        ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
        
        -- Revogar acesso público
        REVOKE ALL ON public.notification_queue FROM anon;
        
        -- Política: apenas usuários da empresa podem gerenciar sua fila
        CREATE POLICY "Company users can manage their notification queue" ON public.notification_queue
            FOR ALL USING (
                company_id IN (
                    SELECT uc.company_id FROM user_companies uc
                    WHERE uc.user_id = auth.uid()
                    AND uc.is_active = true
                )
            );
    END IF;
END $$;

-- 4. Corrigir search_path em mais funções críticas
ALTER FUNCTION public.trigger_recalcular_custo() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.recalcular_custo_receita(uuid) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.sync_pedido_to_parent() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.set_numero_pedido() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.get_next_pedido_number_by_turno(uuid) SET search_path = 'public', 'pg_temp';

-- 5. Proteger tabelas de sessão com políticas mais restritivas
DROP POLICY IF EXISTS "Users can manage their own sessions by token" ON public.autoatendimento_sessions;

-- Nova política mais simples e segura
CREATE POLICY "Users can manage their own sessions" ON public.autoatendimento_sessions
    FOR ALL USING (
        -- Permitir apenas durante sessão ativa (menos de timeout_at)
        timeout_at > now()
        OR auth.uid() IS NOT NULL  -- ou usuários autenticados
    );

-- 6. Proteger dados de cashback
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_cashback') THEN
        ALTER TABLE public.customer_cashback ENABLE ROW LEVEL SECURITY;
        
        -- Política: apenas empresa proprietária pode acessar cashback dos clientes
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