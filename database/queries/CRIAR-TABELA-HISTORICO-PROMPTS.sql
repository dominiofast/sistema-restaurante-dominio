-- CRIAR TABELA DE HISTÓRICO DE PROMPTS
-- Esta tabela armazena o histórico de versões dos prompts

-- 1. CRIAR TABELA DE HISTÓRICO
CREATE TABLE IF NOT EXISTS ai_agent_prompts_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_slug TEXT NOT NULL,
    template TEXT NOT NULL,
    vars JSONB NOT NULL DEFAULT '{}',
    version INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_ai_agent_prompts_history_agent_slug ON ai_agent_prompts_history(agent_slug);
CREATE INDEX IF NOT EXISTS idx_ai_agent_prompts_history_version ON ai_agent_prompts_history(version);
CREATE INDEX IF NOT EXISTS idx_ai_agent_prompts_history_created_at ON ai_agent_prompts_history(created_at);

-- 3. CRIAR TRIGGER PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ai_agent_prompts_history_updated_at ON ai_agent_prompts_history;
CREATE TRIGGER update_ai_agent_prompts_history_updated_at 
    BEFORE UPDATE ON ai_agent_prompts_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. CRIAR TRIGGER PARA SALVAR HISTÓRICO AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION save_prompt_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir no histórico quando o prompt for atualizado
    INSERT INTO ai_agent_prompts_history (
        agent_slug,
        template,
        vars,
        version,
        created_at,
        updated_at
    ) VALUES (
        NEW.agent_slug,
        NEW.template,
        NEW.vars,
        NEW.version,
        NEW.updated_at,
        NEW.updated_at
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_save_prompt_history ON ai_agent_prompts;
CREATE TRIGGER trigger_save_prompt_history
    AFTER UPDATE ON ai_agent_prompts
    FOR EACH ROW
    EXECUTE FUNCTION save_prompt_history();

-- 5. VERIFICAR SE A TABELA FOI CRIADA
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_agent_prompts_history'
ORDER BY ordinal_position;

-- 6. VERIFICAR SE OS TRIGGERS FORAM CRIADOS
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'ai_agent_prompts_history'
   OR event_object_table = 'ai_agent_prompts';

-- 7. INSERIR DADOS INICIAIS DO HISTÓRICO (OPCIONAL)
-- Se já existem prompts, podemos criar histórico inicial
INSERT INTO ai_agent_prompts_history (agent_slug, template, vars, version, created_at, updated_at)
SELECT 
    agent_slug,
    template,
    vars,
    COALESCE(version, 1),
    COALESCE(created_at, NOW()),
    COALESCE(updated_at, NOW())
FROM ai_agent_prompts
WHERE NOT EXISTS (
    SELECT 1 FROM ai_agent_prompts_history h 
    WHERE h.agent_slug = ai_agent_prompts.agent_slug 
    AND h.version = COALESCE(ai_agent_prompts.version, 1)
);

-- 8. VERIFICAR DADOS DO HISTÓRICO
SELECT 
    agent_slug,
    version,
    created_at,
    LENGTH(template) as template_length
FROM ai_agent_prompts_history
ORDER BY agent_slug, version DESC;
