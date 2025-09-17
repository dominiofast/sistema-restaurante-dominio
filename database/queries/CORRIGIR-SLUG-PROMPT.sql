-- 🔧 CORRIGIR SLUG DO PROMPT - Domínio Pizzas
-- Verificar o slug correto da empresa e corrigir o prompt

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
-- PASSO 3: CORRIGIR O PROMPT COM O SLUG CORRETO
-- ================================

-- Primeiro, vou verificar qual é o slug correto da empresa
-- Depois vou atualizar o prompt para usar o slug correto

-- Exemplo (substitua 'dominiopizzas' pelo slug correto que aparecer no PASSO 1):
-- UPDATE ai_agent_prompts 
-- SET 
--     agent_slug = 'SLUG_CORRETO_AQUI',
--     updated_at = NOW()
-- WHERE agent_slug = 'dominiopizzas';

-- ================================
-- PASSO 4: VERIFICAÇÃO FINAL
-- ================================

SELECT 
    'PROMPT CORRIGIDO' as status,
    agent_slug,
    template,
    vars,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas' 
   OR agent_slug LIKE '%dominio%'
   OR agent_slug LIKE '%pizzas%';
