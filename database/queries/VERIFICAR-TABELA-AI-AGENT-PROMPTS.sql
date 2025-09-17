-- VERIFICAR E CORRIGIR TABELA AI_AGENT_PROMPTS
-- Script para diagnosticar e resolver problemas de constraint

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ai_agent_prompts'
ORDER BY ordinal_position;

-- 2. VERIFICAR CONSTRAINTS EXISTENTES
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'ai_agent_prompts';

-- 3. VERIFICAR DADOS EXISTENTES
SELECT 
    agent_slug,
    template,
    version,
    created_at,
    updated_at
FROM ai_agent_prompts
ORDER BY agent_slug;

-- 4. VERIFICAR SE EXISTE REGISTRO PARA DOMINIO PIZZAS
SELECT 
    agent_slug,
    template,
    version,
    created_at,
    updated_at
FROM ai_agent_prompts
WHERE agent_slug = 'dominiopizzas';

-- 5. SE NECESSÁRIO, REMOVER CONSTRAINT PROBLEMÁTICA E RECRIAR
-- (Execute apenas se houver problemas)

-- REMOVER CONSTRAINT SE EXISTIR
-- ALTER TABLE ai_agent_prompts DROP CONSTRAINT IF EXISTS ai_agent_prompts_agent_slug_key;

-- RECRIAR CONSTRAINT CORRETAMENTE
-- ALTER TABLE ai_agent_prompts ADD CONSTRAINT ai_agent_prompts_agent_slug_key UNIQUE (agent_slug);

-- 6. VERIFICAR SE A TABELA TEM COLUNA ID
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_agent_prompts' 
AND column_name = 'id';

-- 7. SE NÃO TIVER ID, ADICIONAR (OPCIONAL)
-- ALTER TABLE ai_agent_prompts ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- 8. VERIFICAR SE TEM COLUNA VERSION
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_agent_prompts' 
AND column_name = 'version';

-- 9. SE NÃO TIVER VERSION, ADICIONAR
-- ALTER TABLE ai_agent_prompts ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 10. VERIFICAR SE TEM COLUNAS DE TIMESTAMP
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_agent_prompts' 
AND column_name IN ('created_at', 'updated_at');

-- 11. SE NÃO TIVER TIMESTAMPS, ADICIONAR
-- ALTER TABLE ai_agent_prompts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- ALTER TABLE ai_agent_prompts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 12. CRIAR TRIGGER PARA ATUALIZAR UPDATED_AT (SE NECESSÁRIO)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- DROP TRIGGER IF EXISTS update_ai_agent_prompts_updated_at ON ai_agent_prompts;
-- CREATE TRIGGER update_ai_agent_prompts_updated_at 
--     BEFORE UPDATE ON ai_agent_prompts 
--     FOR EACH ROW 
--     EXECUTE FUNCTION update_updated_at_column();
