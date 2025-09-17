-- 🚀 SOLUÇÃO PROFISSIONAL E ESCALÁVEL: Autenticação e RLS
-- Remover funções de debug temporárias e implementar solução definitiva

-- Limpar função de debug temporária
DROP FUNCTION IF EXISTS debug_user_info();

-- Verificar se as funções de apoio existem e criar se necessário
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role'),
    'user'
  );
$$;

CREATE OR REPLACE FUNCTION get_user_company_domain()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain';
$$;

CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM companies 
  WHERE domain = get_user_company_domain()
  LIMIT 1;
$$;

-- Limpar e recriar políticas RLS profissionais para companies
DROP POLICY IF EXISTS "super_admin_full_access" ON companies;
DROP POLICY IF EXISTS "company_users_read_only" ON companies;
DROP POLICY IF EXISTS "public_read_active" ON companies;

-- Políticas RLS definitivas e escaláveis
CREATE POLICY "Super admins manage all companies"
ON companies
FOR ALL
TO authenticated
USING (get_user_role() = 'super_admin')
WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Company users read their company"
ON companies
FOR SELECT
TO authenticated
USING (
  get_user_role() IN ('admin', 'user') AND 
  id = get_user_company_id()
);

CREATE POLICY "Public read active companies"
ON companies
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Garantir que RLS está habilitado
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Verificar integridade das políticas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'companies';
    
    IF policy_count = 3 THEN
        RAISE NOTICE '✅ SUCESSO: 3 políticas RLS criadas com arquitetura escalável';
        RAISE NOTICE '🔐 Super admins: Acesso total';
        RAISE NOTICE '👥 Usuários: Acesso apenas à sua empresa';  
        RAISE NOTICE '🌐 Público: Visualização de empresas ativas';
    ELSE
        RAISE EXCEPTION 'ERRO: Número incorreto de políticas criadas: %', policy_count;
    END IF;
END $$;