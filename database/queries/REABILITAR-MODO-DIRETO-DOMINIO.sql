-- 🚨 REABILITAR MODO DIRETO - Domínio Pizzas
-- Corrigir o erro de ter desabilitado o modo direto

-- ================================
-- REABILITAR MODO DIRETO
-- ================================

UPDATE ai_agent_assistants 
SET 
    use_direct_mode = true,
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- VERIFICAÇÃO
-- ================================

SELECT 
    'MODO DIRETO REABILITADO' as status,
    company_id,
    bot_name,
    assistant_id,
    use_direct_mode,
    is_active,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- LOG DA CORREÇÃO
-- ================================

INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'ADMIN',
    'CORREÇÃO: Modo direto reabilitado - erro de ter desabilitado incorretamente',
    're_enable_direct_mode',
    NOW()
);

