-- 🔧 SCRIPT DE CORREÇÃO: RLS Policies para Agente IA
-- Data: 2025-01-27
-- Execute este script caso o anterior não funcione completamente

-- ==============================================
-- CORRIGIR POLÍTICAS RLS MAIS SIMPLES
-- ==============================================

-- Remover políticas existentes problemáticas
DROP POLICY IF EXISTS "Empresas podem gerenciar suas configurações de agente IA" ON ai_agents_config;

-- Criar políticas mais simples e funcionais
CREATE POLICY "Super admins can manage all ai agent configs"
ON ai_agents_config
FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
)
WITH CHECK (
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

CREATE POLICY "Company users can manage their ai agent configs"
ON ai_agents_config
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT id FROM companies 
        WHERE domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
    )
)
WITH CHECK (
    company_id IN (
        SELECT id FROM companies 
        WHERE domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
    )
);

-- Política temporária mais permissiva para testes (REMOVER EM PRODUÇÃO)
CREATE POLICY "Temporary permissive policy for ai_agents_config"
ON ai_agents_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================
-- VERIFICAÇÃO DE DEBUG
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '🔍 DEBUG: Verificando estrutura do JWT...';
    RAISE NOTICE 'Usuário atual: %', auth.uid();
    
    -- Mostrar informações de debug
    RAISE NOTICE '📋 Tabelas disponíveis:';
    RAISE NOTICE '- companies: %', (SELECT COUNT(*) FROM companies);
    RAISE NOTICE '- ai_agents_config: %', (SELECT COUNT(*) FROM ai_agents_config);
    
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATENÇÃO: Política temporária permissiva ativada!';
    RAISE NOTICE '🔒 REMOVA a política temporária após os testes funcionarem.';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Para remover a política temporária após teste:';
    RAISE NOTICE 'DROP POLICY "Temporary permissive policy for ai_agents_config" ON ai_agents_config;';
END $$; 