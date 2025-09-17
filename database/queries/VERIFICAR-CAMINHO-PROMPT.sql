-- 🔍 VERIFICAR CAMINHO DO PROMPT - Domínio Pizzas
-- Descobrir por que não está encontrando o prompt

-- ================================
-- PASSO 1: VERIFICAR SLUG DA EMPRESA
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
-- PASSO 2: VERIFICAR PROMPTS EXISTENTES
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
-- PASSO 3: VERIFICAR TODOS OS PROMPTS
-- ================================

SELECT 
    'TODOS OS PROMPTS' as status,
    agent_slug,
    template,
    vars,
    version,
    updated_at
FROM ai_agent_prompts 
ORDER BY updated_at DESC
LIMIT 10;

-- ================================
-- PASSO 4: VERIFICAR SE EXISTE PROMPT PARA O SLUG DA EMPRESA
-- ================================

-- Primeiro, vou verificar qual é o slug da empresa
-- Depois vou verificar se existe prompt para esse slug

-- Exemplo (substitua 'dominiopizzas' pelo slug correto que aparecer no PASSO 1):
-- SELECT 
--     'PROMPT PARA SLUG DA EMPRESA' as status,
--     agent_slug,
--     template,
--     vars,
--     version,
--     updated_at
-- FROM ai_agent_prompts 
-- WHERE agent_slug = 'SLUG_CORRETO_AQUI';
