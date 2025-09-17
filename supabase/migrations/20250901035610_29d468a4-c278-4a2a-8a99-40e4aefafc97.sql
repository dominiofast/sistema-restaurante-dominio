-- 🔧 CORREÇÃO: RLS Policies para Tabela Companies
-- O superadmin não consegue criar empresas devido a políticas RLS restritivas

-- Primeiro, vamos verificar e corrigir as políticas da tabela companies
-- Remover políticas problemáticas se existirem
DROP POLICY IF EXISTS "Super admins can manage all companies" ON companies;
DROP POLICY IF EXISTS "Company users can view their company" ON companies;
DROP POLICY IF EXISTS "Only super admins can create companies" ON companies;

-- Criar política correta para super admins gerenciarem todas as empresas
CREATE POLICY "Super admins manage all companies"
ON companies
FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
)
WITH CHECK (
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Política para usuários da empresa visualizarem apenas sua empresa
CREATE POLICY "Company users view their company"
ON companies
FOR SELECT
TO authenticated
USING (
    -- Super admins podem ver tudo
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
    OR
    -- Usuários da empresa podem ver apenas sua empresa
    (domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'))
);

-- Política pública para visualização de empresas ativas (para cardápios públicos)
CREATE POLICY "Public can view active companies"
ON companies
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Log de verificação
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS da tabela companies foram corrigidas';
    RAISE NOTICE '🔐 Super admins agora podem criar/gerenciar empresas';
    RAISE NOTICE '👁️ Usuários podem ver apenas suas empresas';
    RAISE NOTICE '🌐 Público pode ver empresas ativas';
END $$;