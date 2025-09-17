-- 🔍 VERIFICAR MODO DIRETO E PROMPT PERSONALIZADO - Domínio Pizzas
-- Execute este script no SQL Editor do Supabase para diagnosticar o problema

-- ================================
-- 1. VERIFICAR CONFIGURAÇÃO DO ASSISTANT
-- ================================

SELECT 
    'ASSISTANT CONFIG' as tipo,
    company_id,
    bot_name,
    assistant_id,
    use_direct_mode,
    is_active,
    created_at,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- 2. VERIFICAR PROMPT PERSONALIZADO
-- ================================

SELECT 
    'PROMPT PERSONALIZADO' as tipo,
    agent_slug,
    template,
    vars,
    version,
    created_at,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- ================================
-- 3. VERIFICAR CONFIGURAÇÃO GLOBAL DA IA
-- ================================

SELECT 
    'CONFIGURAÇÃO GLOBAL IA' as tipo,
    id,
    openai_model,
    max_tokens,
    temperature,
    system_prompt,
    is_active,
    created_at,
    updated_at
FROM ai_global_config 
WHERE is_active = true;

-- ================================
-- 4. VERIFICAR LOGS RECENTES DE CONVERSAS
-- ================================

SELECT 
    'LOGS RECENTES' as tipo,
    id,
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
FROM ai_conversation_logs 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY created_at DESC
LIMIT 5;

-- ================================
-- 5. VERIFICAR SE HÁ CONFIGURAÇÃO DE ASSISTANT ID
-- ================================

SELECT 
    'ASSISTANT MAPPINGS' as tipo,
    id,
    agent_slug,
    assistant_id,
    company_id,
    is_active,
    created_at,
    updated_at
FROM ai_assistant_mappings 
WHERE agent_slug = 'dominiopizzas' OR company_id = '550e8400-e29b-41d4-a716-446655440001';
