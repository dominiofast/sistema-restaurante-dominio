-- SECURITY HARDENING MIGRATION
-- 1) Roles infra + helper functions (security definer)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin','admin','store_admin','user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  company_id uuid NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, company_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- Minimal RLS to allow users to view their own roles (optional visibility)
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Helper: get_user_role() - highest privilege for current user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT COALESCE((
    SELECT role::text FROM public.user_roles
    WHERE user_id = auth.uid()
    ORDER BY 
      CASE role
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'store_admin' THEN 3
        ELSE 4
      END
    LIMIT 1
  ), 'user'::text);
$$;

-- Helper: get_user_company_domain() based on secure company_id lookup
CREATE OR REPLACE FUNCTION public.get_user_company_domain()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT c.domain FROM public.companies c
  WHERE c.id = public.get_user_company_id();
$$;

-- 2) Lock down overly-permissive policies on sensitive tables
-- ai_global_config (contains API keys)
DROP POLICY IF EXISTS "Allow all operations on ai_global_config" ON public.ai_global_config;
DROP POLICY IF EXISTS "Super admins can create global AI config" ON public.ai_global_config;
DROP POLICY IF EXISTS "Super admins can delete global AI config" ON public.ai_global_config;
DROP POLICY IF EXISTS "Super admins can update global AI config" ON public.ai_global_config;
DROP POLICY IF EXISTS "Super admins can view global AI config" ON public.ai_global_config;

-- Recreate explicit super_admin-only policies
CREATE POLICY "Super admins manage ai_global_config" ON public.ai_global_config
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- company_credentials: remove public read
DROP POLICY IF EXISTS "Public can read company credentials for login" ON public.company_credentials;
DROP POLICY IF EXISTS "Super admins can manage company credentials" ON public.company_credentials;
CREATE POLICY "Super admins manage company_credentials" ON public.company_credentials
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- ai_agent_config
DROP POLICY IF EXISTS "Allow all operations on ai_agent_config" ON public.ai_agent_config;
CREATE POLICY "Company users manage ai_agent_config" ON public.ai_agent_config
FOR ALL TO authenticated
USING (company_id = public.get_user_company_id() OR public.get_user_role() = 'super_admin')
WITH CHECK (company_id = public.get_user_company_id() OR public.get_user_role() = 'super_admin');

-- ai_agents_config
DROP POLICY IF EXISTS "Allow all operations on ai_agents_config" ON public.ai_agents_config;
DROP POLICY IF EXISTS "Company users can manage their ai agent configs" ON public.ai_agents_config;
DROP POLICY IF EXISTS "Super admins can manage all ai agent configs" ON public.ai_agents_config;
DROP POLICY IF EXISTS "Temporary permissive policy for ai_agents_config" ON public.ai_agents_config;
CREATE POLICY "Company users manage ai_agents_config" ON public.ai_agents_config
FOR ALL TO authenticated
USING (company_id = public.get_user_company_id() OR public.get_user_role() = 'super_admin')
WITH CHECK (company_id = public.get_user_company_id() OR public.get_user_role() = 'super_admin');

-- ai_conversation_logs
DROP POLICY IF EXISTS "Allow all operations on ai_conversation_logs" ON public.ai_conversation_logs;
CREATE POLICY "Company read conversation logs" ON public.ai_conversation_logs
FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id() OR public.get_user_role() = 'super_admin');
CREATE POLICY "Company insert conversation logs" ON public.ai_conversation_logs
FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company_id() OR public.get_user_role() = 'super_admin');
CREATE POLICY "Super admins update conversation logs" ON public.ai_conversation_logs
FOR UPDATE TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');
CREATE POLICY "Super admins delete conversation logs" ON public.ai_conversation_logs
FOR DELETE TO authenticated
USING (public.get_user_role() = 'super_admin');

-- ai_security_logs (restrict to super admins)
DROP POLICY IF EXISTS "Allow all operations on ai_security_logs" ON public.ai_security_logs;
CREATE POLICY "Super admins manage ai_security_logs" ON public.ai_security_logs
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- ai_security_settings
DROP POLICY IF EXISTS "Allow all operations on ai_security_settings" ON public.ai_security_settings;
CREATE POLICY "Company manage ai_security_settings" ON public.ai_security_settings
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- ai_rate_limits
DROP POLICY IF EXISTS "Allow all operations on ai_rate_limits" ON public.ai_rate_limits;
CREATE POLICY "Company manage ai_rate_limits" ON public.ai_rate_limits
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- ai_model_configs
DROP POLICY IF EXISTS "Allow all operations on ai_model_configs" ON public.ai_model_configs;
CREATE POLICY "Company manage ai_model_configs" ON public.ai_model_configs
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- ai_webhooks
DROP POLICY IF EXISTS "Allow all operations on ai_webhooks" ON public.ai_webhooks;
CREATE POLICY "Company manage ai_webhooks" ON public.ai_webhooks
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- ai_cache_configs
DROP POLICY IF EXISTS "Allow all operations on ai_cache_configs" ON public.ai_cache_configs;
CREATE POLICY "Company manage ai_cache_configs" ON public.ai_cache_configs
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- ai_backup_configs
DROP POLICY IF EXISTS "Allow all operations on ai_backup_configs" ON public.ai_backup_configs;
CREATE POLICY "Company manage ai_backup_configs" ON public.ai_backup_configs
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- ai_usage_analytics
DROP POLICY IF EXISTS "Allow all operations on ai_usage_analytics" ON public.ai_usage_analytics;
CREATE POLICY "Company manage ai_usage_analytics" ON public.ai_usage_analytics
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- cardapio_branding: tighten manage policy to company scope, keep public read active branding
DROP POLICY IF EXISTS "Users can manage their company branding" ON public.cardapio_branding;
CREATE POLICY "Company manage branding" ON public.cardapio_branding
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- agente_ia_config legacy: restrict too
DROP POLICY IF EXISTS "Allow all operations on agente_ia_config" ON public.agente_ia_config;
CREATE POLICY "Company manage agente_ia_config" ON public.agente_ia_config
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- categorias & categorias_adicionais: restrict to company (if present)
DROP POLICY IF EXISTS "Allow all operations on categorias" ON public.categorias;
CREATE POLICY "Company manage categorias" ON public.categorias
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Allow all operations on categorias_adicionais" ON public.categorias_adicionais;
CREATE POLICY "Company manage categorias_adicionais" ON public.categorias_adicionais
FOR ALL TO authenticated
USING ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin')
WITH CHECK ((company_id = public.get_user_company_id()) OR public.get_user_role() = 'super_admin');

-- Ensure RLS enabled on all updated tables
ALTER TABLE public.ai_global_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_backup_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardapio_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agente_ia_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_adicionais ENABLE ROW LEVEL SECURITY;

-- Final notices
DO $$ BEGIN
  RAISE NOTICE 'Security hardening applied: policies tightened and helper functions created.';
END $$;