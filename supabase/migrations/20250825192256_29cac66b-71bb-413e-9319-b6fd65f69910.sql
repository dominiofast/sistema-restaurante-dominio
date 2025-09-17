-- 🔧 CORREÇÃO ESPECÍFICA: Funções auxiliares para RLS
-- Data: 2025-01-27

-- ==============================================
-- VERIFICAR E CRIAR FUNÇÕES AUXILIARES
-- ==============================================

-- Função para obter company_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() 
        AND uc.is_active = true 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT uc.role 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() 
        AND uc.is_active = true 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================
-- RECRIAR POLÍTICA TEMPORÁRIA PERMISSIVA
-- ==============================================

-- Remover política temporária se existe
DROP POLICY IF EXISTS "temp_permissive_branding" ON cardapio_branding;

-- Criar política temporária mais permissiva para debug
CREATE POLICY "temp_permissive_branding"
ON cardapio_branding
FOR ALL
TO authenticated
USING (
    auth.uid() IS NOT NULL
)
WITH CHECK (
    auth.uid() IS NOT NULL
);

-- ==============================================
-- VERIFICAÇÃO DE DEBUG
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Funções auxiliares criadas/atualizadas';
    RAISE NOTICE '✅ Política temporária permissiva ativada';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Teste salvando configuração agora.';
    RAISE NOTICE '⚠️  LEMBRE-SE: Remover política temporária após teste!';
END $$;