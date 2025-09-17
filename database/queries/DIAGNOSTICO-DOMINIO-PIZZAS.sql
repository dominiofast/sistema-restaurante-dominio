-- 🔍 DIAGNÓSTICO COMPLETO: Domínio Pizzas - Por que não está respondendo?
-- Execute este script no SQL Editor do Supabase para diagnosticar o problema

-- ================================
-- 1. VERIFICAR CONFIGURAÇÃO DA EMPRESA
-- ================================

SELECT 
    'EMPRESA' as tipo,
    id,
    name,
    slug,
    status,
    created_at
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- 2. VERIFICAR INTEGRAÇÃO WHATSAPP
-- ================================

SELECT 
    'INTEGRAÇÃO WHATSAPP' as tipo,
    id,
    company_id,
    instance_key,
    host,
    token,
    purpose,
    ia_agent_preset,
    ia_model,
    ia_temperature,
    webhook,
    created_at,
    updated_at
FROM whatsapp_integrations 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- 3. VERIFICAR CONFIGURAÇÃO DO AGENTE IA
-- ================================

SELECT 
    'AGENTE IA' as tipo,
    id,
    company_id,
    is_active,
    agent_name,
    personality,
    language,
    welcome_message,
    response_speed,
    detail_level,
    sales_aggressiveness,
    created_at,
    updated_at
FROM ai_agent_config 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- 4. VERIFICAR PROMPT PERSONALIZADO
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
-- 5. VERIFICAR CONFIGURAÇÃO DE ASSISTANT
-- ================================

SELECT 
    'ASSISTANT CONFIG' as tipo,
    id,
    company_id,
    assistant_id,
    use_direct_mode,
    is_active,
    created_at,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- 6. VERIFICAR LOGS RECENTES
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
-- 7. VERIFICAR CHATS WHATSAPP
-- ================================

SELECT 
    'CHATS WHATSAPP' as tipo,
    id,
    company_id,
    chat_id,
    customer_name,
    customer_phone,
    unread_count,
    last_message,
    ai_paused,
    created_at,
    updated_at
FROM whatsapp_chats 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY updated_at DESC
LIMIT 5;

-- ================================
-- 8. VERIFICAR MENSAGENS RECENTES
-- ================================

SELECT 
    'MENSAGENS RECENTES' as tipo,
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
-- 9. VERIFICAR CONFIGURAÇÃO GLOBAL DA IA
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
-- 10. VERIFICAR CONFIGURAÇÕES DE PAUSA
-- ================================

SELECT 
    'CONFIGURAÇÕES DE PAUSA' as tipo,
    key,
    value,
    description,
    created_at,
    updated_at
FROM app_settings 
WHERE key LIKE '%pause%' OR key LIKE '%emergency%' OR key LIKE '%block%';

-- ================================
-- 11. VERIFICAR WEBHOOKS ATIVOS
-- ================================

SELECT 
    'WEBHOOKS ATIVOS' as tipo,
    'Verificar se o webhook está apontando para:' as info,
    'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook' as webhook_url,
    'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/ai-processor' as ai_processor_url;

-- ================================
-- 12. VERIFICAR SE HÁ ERROS NO SISTEMA
-- ================================

SELECT 
    'ERROS RECENTES' as tipo,
    'Verificar logs do Supabase Edge Functions para erros recentes' as info,
    'Especialmente nas funções: whatsapp-webhook, ai-processor, ai-chat-direct' as funcoes_para_verificar;
