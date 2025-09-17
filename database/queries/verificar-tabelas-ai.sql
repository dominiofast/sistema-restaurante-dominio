-- Script para verificar tabelas do Agente IA
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar quais tabelas relacionadas ao AI existem
SELECT 
    table_name,
    'Existe' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
    table_name LIKE '%ai%agent%config%' 
    OR table_name LIKE '%agente%ia%config%'
    OR table_name = 'ai_global_config'
)
ORDER BY table_name;

-- 2. Verificar estrutura da tabela ai_agent_config (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'ai_agent_config'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela ai_agents_config (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'ai_agents_config'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela agente_ia_config (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'agente_ia_config'
ORDER BY ordinal_position;

-- 5. Contar registros em cada tabela (se existirem)
DO $$
DECLARE
    ai_agent_count INTEGER := 0;
    ai_agents_count INTEGER := 0;
    agente_ia_count INTEGER := 0;
BEGIN
    -- Verificar ai_agent_config
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_agent_config') THEN
        SELECT COUNT(*) INTO ai_agent_count FROM ai_agent_config;
        RAISE NOTICE 'Tabela ai_agent_config: % registros', ai_agent_count;
    ELSE
        RAISE NOTICE 'Tabela ai_agent_config: NÃO EXISTE';
    END IF;
    
    -- Verificar ai_agents_config
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_agents_config') THEN
        SELECT COUNT(*) INTO ai_agents_count FROM ai_agents_config;
        RAISE NOTICE 'Tabela ai_agents_config: % registros', ai_agents_count;
    ELSE
        RAISE NOTICE 'Tabela ai_agents_config: NÃO EXISTE';
    END IF;
    
    -- Verificar agente_ia_config
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agente_ia_config') THEN
        SELECT COUNT(*) INTO agente_ia_count FROM agente_ia_config;
        RAISE NOTICE 'Tabela agente_ia_config: % registros', agente_ia_count;
    ELSE
        RAISE NOTICE 'Tabela agente_ia_config: NÃO EXISTE';
    END IF;
END $$;

-- 6. Verificar políticas RLS
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('ai_agent_config', 'ai_agents_config', 'agente_ia_config')
ORDER BY tablename, policyname;