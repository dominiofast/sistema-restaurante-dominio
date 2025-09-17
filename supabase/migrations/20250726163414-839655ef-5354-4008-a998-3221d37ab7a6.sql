-- ==========================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA RLS
-- Migração de user_metadata para app_metadata
-- ==========================================

-- 1. Criar função segura para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role'),
    'user'
  );
$$;

-- 2. Criar função segura para obter domínio da empresa do usuário  
CREATE OR REPLACE FUNCTION public.get_user_company_domain()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'company_domain'),
    (auth.jwt() -> 'user_metadata' ->> 'company_domain')
  );
$$;

-- 3. Criar função segura para obter companies permitidas para o usuário
CREATE OR REPLACE FUNCTION public.get_user_companies()
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT COALESCE(
    string_to_array((auth.jwt() -> 'app_metadata' ->> 'companies'), ','),
    ARRAY[(auth.jwt() -> 'app_metadata' ->> 'company_id')]::text[],
    ARRAY[]::text[]
  );
$$;

-- 4. Criar função para verificar se usuário pode acessar empresa
CREATE OR REPLACE FUNCTION public.can_access_company(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT 
    get_user_role() = 'super_admin' OR
    company_uuid::text = ANY(get_user_companies()) OR
    company_uuid IN (
      SELECT id FROM companies 
      WHERE domain = get_user_company_domain()
    );
$$;