-- ==========================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA RLS - Parte 2
-- Dropar e recriar funções conflitantes
-- ==========================================

-- Dropar função conflitante
DROP FUNCTION IF EXISTS public.can_access_company(uuid);

-- Recriar função para verificar se usuário pode acessar empresa
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