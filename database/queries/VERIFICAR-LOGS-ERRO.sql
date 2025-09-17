-- 🔍 VERIFICAR LOGS DE ERRO - Domínio Pizzas
-- Descobrir por que ainda está chegando mensagem padrão

-- ================================
-- LOGS RECENTES DA CONVERSA
-- ================================

SELECT 
    'LOGS RECENTES' as status,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
FROM ai_conversation_logs 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;

-- ================================
-- VERIFICAR SE AGENTE ESTÁ ATIVO
-- ================================

SELECT 
    'AGENTE IA STATUS' as status,
    company_id,
    is_active,
    agent_name,
    welcome_message,
    updated_at
FROM ai_agent_config 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- VERIFICAR MODO DIRETO
-- ================================

SELECT 
    'MODO DIRETO STATUS' as status,
    company_id,
    bot_name,
    assistant_id,
    use_direct_mode,
    is_active,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- VERIFICAR PROMPT ATUAL
-- ================================

SELECT 
    'PROMPT ATUAL' as status,
    agent_slug,
    template,
    vars,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';
