-- CORREÇÃO FINAL CONSERVADORA - Proteger dados críticos restantes

-- 1. Corrigir search_path em funções adicionais
DO $$
BEGIN
    -- Lista de funções para corrigir search_path
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'ensure_ai_agent_assistant') THEN
        ALTER FUNCTION public.ensure_ai_agent_assistant() SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'generate_assistant_name') THEN
        ALTER FUNCTION public.generate_assistant_name(text) SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'create_initial_item_status') THEN
        ALTER FUNCTION public.create_initial_item_status() SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'update_client_status_by_inactivity') THEN
        ALTER FUNCTION public.update_client_status_by_inactivity() SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'auto_print_pedido_on_insert') THEN
        ALTER FUNCTION public.auto_print_pedido_on_insert() SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'generate_company_slug') THEN
        ALTER FUNCTION public.generate_company_slug() SET search_path = 'public', 'pg_temp';
    END IF;
END $$;

-- 2. Proteger tabelas de notificação (verificando estrutura primeiro)
DO $$
BEGIN
    -- Proteger notification_logs (sem assumir company_id)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_logs') THEN
        ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
        
        -- Revogar acesso público
        REVOKE ALL ON public.notification_logs FROM anon;
        
        -- Política simples: apenas usuários autenticados
        DROP POLICY IF EXISTS "Authenticated users can read notification logs" ON public.notification_logs;
        CREATE POLICY "Authenticated users can read notification logs" ON public.notification_logs
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    -- Proteger notification_queue
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_queue') THEN
        ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
        
        -- Revogar acesso público
        REVOKE ALL ON public.notification_queue FROM anon;
        
        -- Política: apenas usuários autenticados
        DROP POLICY IF EXISTS "Authenticated users can manage notification queue" ON public.notification_queue;
        CREATE POLICY "Authenticated users can manage notification queue" ON public.notification_queue
            FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 3. Garantir que tabelas de vagas tenham RLS (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vagas') THEN
        ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;
        
        -- Política para vagas: empresa proprietária + acesso público para ativas
        DROP POLICY IF EXISTS "Company manage vagas" ON public.vagas;
        DROP POLICY IF EXISTS "Public view active vagas" ON public.vagas;
        
        CREATE POLICY "Company manage vagas" ON public.vagas
            FOR ALL USING (
                company_id IN (
                    SELECT uc.company_id FROM user_companies uc
                    WHERE uc.user_id = auth.uid()
                    AND uc.is_active = true
                )
            );
            
        CREATE POLICY "Public view active vagas" ON public.vagas
            FOR SELECT USING (ativa = true);
    END IF;
END $$;

-- 4. Garantir RLS em mais tabelas críticas de logs
DO $$
BEGIN
    -- Proteger logs de importação
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'import_logs') THEN
        -- Política já criada, apenas garantir RLS
        ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;