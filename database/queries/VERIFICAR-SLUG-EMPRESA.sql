-- 🔍 VERIFICAR SLUG DA EMPRESA - Domínio Pizzas
-- Descobrir qual é o slug correto para configurar o prompt

-- ================================
-- VERIFICAR SLUG DA EMPRESA
-- ================================

SELECT 
    'SLUG DA EMPRESA' as status,
    id as company_id,
    name as company_name,
    slug as company_slug,
    created_at
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- VERIFICAR PROMPTS EXISTENTES
-- ================================

SELECT 
    'PROMPTS EXISTENTES' as status,
    agent_slug,
    template,
    vars,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug LIKE '%dominiopizzas%' 
   OR agent_slug LIKE '%dominio%'
   OR agent_slug LIKE '%pizzas%';

-- ================================
-- VERIFICAR CONFIGURAÇÃO ATUAL
-- ================================

SELECT 
    'CONFIGURAÇÃO ATUAL' as status,
    company_id,
    bot_name,
    assistant_id,
    use_direct_mode,
    is_active,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';
