-- CORREÇÃO CRÍTICA DE SEGURANÇA: Remover política temporária perigosa e implementar RLS adequado

-- 1. Remover política temporária extremamente perigosa
DROP POLICY IF EXISTS "Temporary permissive policy for ai_agents_config" ON ai_agents_config;

-- 2. Criar função SECURITY DEFINER para verificar roles de forma segura
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'raw_user_meta_data' ->> 'role',
    'user'
  );
$$;

-- 3. Criar função para verificar domínio da empresa
CREATE OR REPLACE FUNCTION public.get_user_company_domain()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain',
    ''
  );
$$;

-- 4. Implementar políticas RLS seguras para ai_agents_config
CREATE POLICY "Super admins can manage all ai agent configs"
ON ai_agents_config
FOR ALL
TO authenticated
USING (get_user_role() = 'super_admin')
WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Company users can manage their ai agent configs"
ON ai_agents_config
FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT id FROM companies 
    WHERE domain = get_user_company_domain()
  )
)
WITH CHECK (
  company_id IN (
    SELECT id FROM companies 
    WHERE domain = get_user_company_domain()
  )
);

-- 5. Habilitar RLS na tabela app_settings (estava sem proteção!)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can access app settings"
ON app_settings
FOR ALL
TO authenticated
USING (get_user_role() = 'super_admin')
WITH CHECK (get_user_role() = 'super_admin');

-- 6. Corrigir funções inseguras adicionando search_path
CREATE OR REPLACE FUNCTION public.can_access_company(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN get_user_role() = 'super_admin' THEN TRUE
      WHEN EXISTS (
        SELECT 1 FROM companies 
        WHERE id = target_company_id 
        AND domain = get_user_company_domain()
      ) THEN TRUE
      ELSE FALSE
    END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_caixa(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN get_user_role() = 'super_admin' THEN TRUE
      WHEN EXISTS (
        SELECT 1 FROM companies 
        WHERE id = target_company_id 
        AND domain = get_user_company_domain()
      ) THEN TRUE
      ELSE FALSE
    END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_customer_addresses(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN get_user_role() = 'super_admin' THEN TRUE
      WHEN EXISTS (
        SELECT 1 FROM companies 
        WHERE id = target_company_id 
        AND domain = get_user_company_domain()
      ) THEN TRUE
      ELSE FALSE
    END;
$$;