-- 🔧 DEBUG: Verificar e limpar políticas conflitantes da tabela companies

-- Primeiro, vamos verificar os metadados do usuário atual
CREATE OR REPLACE FUNCTION debug_user_info() 
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'user_id', auth.uid(),
    'jwt_payload', auth.jwt(),
    'raw_user_meta_data', auth.jwt() -> 'raw_user_meta_data',
    'user_role', auth.jwt() -> 'raw_user_meta_data' ->> 'role',
    'company_domain', auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limpar TODAS as políticas antigas da tabela companies
DROP POLICY IF EXISTS "Allow authenticated users to read companies" ON companies;
DROP POLICY IF EXISTS "Allow company creation during signup" ON companies;
DROP POLICY IF EXISTS "Allow public to read active companies for vagas" ON companies;
DROP POLICY IF EXISTS "Allow super admins to delete companies" ON companies;
DROP POLICY IF EXISTS "Allow super admins to insert companies" ON companies;
DROP POLICY IF EXISTS "Allow super admins to update companies" ON companies;
DROP POLICY IF EXISTS "Company users view their company" ON companies;
DROP POLICY IF EXISTS "Public can view active companies" ON companies;
DROP POLICY IF EXISTS "Super admins manage all companies" ON companies;

-- Criar políticas limpas e funcionais
-- 1. SUPER ADMIN: Acesso total
CREATE POLICY "super_admin_full_access"
ON companies
FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
)
WITH CHECK (
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- 2. USUARIOS DA EMPRESA: Só visualizar sua empresa
CREATE POLICY "company_users_read_only"
ON companies
FOR SELECT
TO authenticated
USING (
    domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
);

-- 3. PÚBLICO: Visualizar empresas ativas (para cardápios)
CREATE POLICY "public_read_active"
ON companies
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Verificar as novas políticas
SELECT 'NOVA CONFIGURACAO DE POLÍTICAS COMPANIES:' as info;
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'companies';

-- Log final
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS da tabela companies foram COMPLETAMENTE recriadas';
    RAISE NOTICE '🔐 Super admins têm acesso TOTAL (INSERT, UPDATE, DELETE, SELECT)';
    RAISE NOTICE '👁️ Usuários da empresa podem apenas VER sua empresa';
    RAISE NOTICE '🌐 Público pode ver empresas ativas';
    RAISE NOTICE '🔍 Use SELECT debug_user_info(); para verificar metadados do usuário';
END $$;