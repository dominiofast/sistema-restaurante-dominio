-- 🔍 DIAGNÓSTICO COMPLETO: Por que mensagens padrão estão sendo geradas?
-- Execute este script no SQL Editor do Supabase para investigar o problema

-- ================================
-- 1. VERIFICAR SE O MODO DIRETO ESTÁ ATIVO
-- ================================

SELECT 
    'MODO DIRETO' as tipo,
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
-- 3. VERIFICAR LOGS RECENTES DE PROCESSAMENTO
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
LIMIT 10;

-- ================================
-- 4. VERIFICAR SE HÁ PAUSAS ATIVAS
-- ================================

SELECT 
    'PAUSAS ATIVAS' as tipo,
    id,
    company_id,
    chat_id,
    customer_name,
    customer_phone,
    ai_paused,
    created_at,
    updated_at
FROM whatsapp_chats 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
AND ai_paused = true;

-- ================================
-- 5. VERIFICAR CONFIGURAÇÃO GLOBAL DA IA
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
-- 6. VERIFICAR MENSAGENS RECENTES DO WHATSAPP
-- ================================

SELECT 
    'MENSAGENS WHATSAPP' as tipo,
    id,
    company_id,
    chat_id,
    message_content,
    is_from_me,
    timestamp,
    created_at
FROM whatsapp_messages 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY created_at DESC
LIMIT 10;

-- ================================
-- 7. VERIFICAR SE HÁ CONFIGURAÇÕES DE ASSISTANT ID
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

-- ================================
-- 8. VERIFICAR CONFIGURAÇÕES DE EMERGÊNCIA
-- ================================

SELECT 
    'CONFIGURAÇÕES EMERGÊNCIA' as tipo,
    key,
    value,
    description,
    created_at,
    updated_at
FROM app_settings 
WHERE key LIKE '%emergency%' OR key LIKE '%block%' OR key LIKE '%pause%';

-- ================================
-- 9. VERIFICAR SE A FUNÇÃO AI-CHAT-DIRECT ESTÁ SENDO CHAMADA
-- ================================

SELECT 
    'LOGS DE FUNÇÕES' as tipo,
    'Verificar logs do Supabase Edge Functions para:' as info,
    '1. ai-chat-direct - se está sendo chamada' as funcao1,
    '2. ai-processor - se está redirecionando corretamente' as funcao2,
    '3. agente-ia-conversa-v2 - se está sendo usada como fallback' as funcao3;

-- ================================
-- 10. VERIFICAR SE O PROMPT ESTÁ SENDO APLICADO
-- ================================

SELECT 
    'VERIFICAÇÃO DO PROMPT' as tipo,
    'Para verificar se o prompt está sendo aplicado:' as info,
    '1. Verificar logs da função ai-chat-direct' as passo1,
    '2. Verificar se o template está sendo renderizado' as passo2,
    '3. Verificar se as variáveis estão sendo substituídas' as passo3,
    '4. Verificar se a resposta da OpenAI está usando o prompt correto' as passo4;

