-- 🔍 VERIFICAR MODO DIRETO - Domínio Pizzas
-- Execute este script para verificar e corrigir o problema

-- ================================
-- 1. VERIFICAR SE O MODO DIRETO ESTÁ ATIVO
-- ================================

SELECT 
    'MODO DIRETO ATUAL' as status,
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
-- 2. DESABILITAR MODO DIRETO TEMPORARIAMENTE
-- ================================

-- Desabilitar modo direto para forçar uso da função agente-ia-conversa
UPDATE ai_agent_assistants 
SET 
    use_direct_mode = false,
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- 3. VERIFICAR SE O PROMPT PERSONALIZADO ESTÁ ATIVO
-- ================================

SELECT 
    'PROMPT PERSONALIZADO' as status,
    agent_slug,
    template,
    vars,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- ================================
-- 4. VERIFICAR CONFIGURAÇÃO DO AGENTE
-- ================================

SELECT 
    'AGENTE IA CONFIG' as status,
    company_id,
    is_active,
    agent_name,
    personality,
    language,
    welcome_message,
    updated_at
FROM ai_agent_config 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- 5. LOG DA CORREÇÃO
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
    'CORREÇÃO: Modo direto desabilitado para forçar uso da função agente-ia-conversa',
    'disable_direct_mode',
    NOW()
);

-- ================================
-- 6. VERIFICAÇÃO FINAL
-- ================================

SELECT 
    'MODO DIRETO DESABILITADO' as status,
    company_id,
    bot_name,
    assistant_id,
    use_direct_mode,
    is_active,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';
