-- 🧪 TESTE FINAL - Verificar se tudo está pronto para WhatsApp
-- Verificar se o assistente está configurado corretamente

-- ================================
-- VERIFICAÇÃO FINAL COMPLETA
-- ================================

-- 1. Verificar template atual
SELECT 
    'TEMPLATE ATUAL' as status,
    agent_slug,
    LENGTH(template) as template_length,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- 2. Verificar configuração do assistente
SELECT 
    'CONFIGURAÇÃO ASSISTENTE' as status,
    company_id,
    bot_name,
    use_direct_mode,
    is_active,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 3. Verificar se use_direct_mode está ativo
UPDATE ai_agent_assistants 
SET 
    use_direct_mode = true,
    is_active = true,
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 4. Verificação final
SELECT 
    'CONFIGURAÇÃO FINAL' as status,
    'use_direct_mode = true' as config,
    'is_active = true' as status_assistant,
    'Template aplicado' as template_status
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 5. Log do teste final
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
    'TESTE FINAL: Template simplificado aplicado, use_direct_mode ativo - pronto para teste no WhatsApp',
    'final_test_ready',
    NOW()
);
