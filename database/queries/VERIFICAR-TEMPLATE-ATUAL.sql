-- 🔍 VERIFICAR TEMPLATE ATUAL - Domínio Pizzas
-- Verificar se o template está aplicado corretamente

-- ================================
-- VERIFICAÇÃO DO TEMPLATE
-- ================================

SELECT 
    'VERIFICAÇÃO TEMPLATE' as status,
    agent_slug,
    template,
    vars,
    version,
    updated_at,
    LENGTH(template) as template_length
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- ================================
-- VERIFICAR SE TEMPLATE ESTÁ COMPLETO
-- ================================

SELECT 
    CASE 
        WHEN template LIKE '%Prompt Global - Assistente Virtual Inteligente v2.0%' THEN '✅ TEMPLATE COMPLETO APLICADO'
        WHEN template LIKE '%Sistema de Memória Contextual%' THEN '✅ TEMPLATE CONVERSACIONAL APLICADO'
        WHEN template LIKE '%Uso Inteligente e Variado de Emojis%' THEN '✅ TEMPLATE EMOJIS APLICADO'
        ELSE '❌ TEMPLATE INCOMPLETO OU ANTIGO'
    END as status_template,
    agent_slug,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- ================================
-- VERIFICAR CONFIGURAÇÃO DO ASSISTENTE
-- ================================

SELECT 
    'CONFIGURAÇÃO ASSISTENTE' as status,
    company_id,
    bot_name,
    use_direct_mode,
    is_active,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- ÚLTIMOS LOGS DE CONVERSA
-- ================================

SELECT 
    'ÚLTIMOS LOGS' as status,
    customer_phone,
    message_type,
    message_content,
    created_at
FROM ai_conversation_logs 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY created_at DESC
LIMIT 5;
