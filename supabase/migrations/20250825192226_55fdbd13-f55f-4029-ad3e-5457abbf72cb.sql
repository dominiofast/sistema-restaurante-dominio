-- 🔧 CORREÇÃO DEFINITIVA: RLS Policies para cardapio_branding
-- Data: 2025-01-27

-- ==============================================
-- REMOVER POLÍTICAS PROBLEMÁTICAS
-- ==============================================

-- Remover todas as políticas existentes da tabela cardapio_branding
DROP POLICY IF EXISTS "Company users can delete branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Company users can delete their branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Company users can insert their branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Company users can update their branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Company users can view branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Public can view active branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Super admins can delete any branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Super admins can insert any branding" ON cardapio_branding;
DROP POLICY IF EXISTS "Super admins can update any branding" ON cardapio_branding;

-- ==============================================
-- CRIAR POLÍTICAS FUNCIONAIS E SIMPLES
-- ==============================================

-- Política para visualização pública de branding ativo
CREATE POLICY "public_view_active_branding"
ON cardapio_branding
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Política para usuários autenticados gerenciarem branding da própria empresa
CREATE POLICY "users_manage_company_branding"
ON cardapio_branding
FOR ALL
TO authenticated
USING (
    auth.uid() IS NOT NULL
    AND (
        -- Verificar se o usuário pertence à empresa
        company_id IN (
            SELECT uc.company_id 
            FROM user_companies uc 
            WHERE uc.user_id = auth.uid() 
            AND uc.is_active = true
        )
        OR
        -- Ou se é super admin
        EXISTS (
            SELECT 1 FROM user_companies uc
            JOIN companies c ON c.id = uc.company_id
            WHERE uc.user_id = auth.uid()
            AND uc.role = 'super_admin'
        )
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
        -- Verificar se o usuário pertence à empresa
        company_id IN (
            SELECT uc.company_id 
            FROM user_companies uc 
            WHERE uc.user_id = auth.uid() 
            AND uc.is_active = true
        )
        OR
        -- Ou se é super admin
        EXISTS (
            SELECT 1 FROM user_companies uc
            JOIN companies c ON c.id = uc.company_id
            WHERE uc.user_id = auth.uid()
            AND uc.role = 'super_admin'
        )
    )
);

-- ==============================================
-- VERIFICAÇÃO DE DEBUG
-- ==============================================

-- Verificar se as políticas foram criadas
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS corrigidas para cardapio_branding';
    RAISE NOTICE '📋 Políticas ativas:';
    RAISE NOTICE '- public_view_active_branding: Para visualização pública';
    RAISE NOTICE '- users_manage_company_branding: Para usuários da empresa';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Teste salvando uma configuração agora.';
END $$;