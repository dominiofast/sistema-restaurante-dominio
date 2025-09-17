-- 🔄 REVERTER MIGRAÇÃO PARA GPT-4O-MINI
-- Data: 2025-01-27
-- Objetivo: Voltar todas as configurações para GPT-4o-mini

-- ================================
-- PASSO 1: REVERTER CONFIGURAÇÃO GLOBAL
-- ================================

-- Reverter configuração global para GPT-4o-mini
UPDATE ai_global_config 
SET 
    openai_model = 'gpt-4o-mini',
    max_tokens = 1000, -- Voltar para valor padrão do GPT-4o
    temperature = 0.7,
    updated_at = NOW()
WHERE is_active = true;

-- Verificar se foi revertido
SELECT 
    '✅ CONFIGURAÇÃO GLOBAL REVERTIDA' as status,
    openai_model,
    max_tokens,
    temperature,
    updated_at
FROM ai_global_config 
WHERE is_active = true;

-- ================================
-- PASSO 2: REVERTER INTEGRAÇÕES WHATSAPP
-- ================================

-- Reverter todas as integrações WhatsApp para GPT-4o-mini
UPDATE whatsapp_integrations 
SET 
    ia_model = 'gpt-4o-mini',
    ia_temperature = 0.7,
    updated_at = NOW()
WHERE ia_model IS NOT NULL;

-- Verificar integrações revertidas
SELECT 
    '✅ INTEGRAÇÕES WHATSAPP REVERTIDAS' as status,
    COUNT(*) as total_revertidas,
    STRING_AGG(DISTINCT ia_model, ', ') as modelos_ativos
FROM whatsapp_integrations 
WHERE ia_model IS NOT NULL;

-- ================================
-- PASSO 3: VERIFICAÇÃO FINAL
-- ================================

-- Resumo do rollback
SELECT 
    '🎯 RESUMO DO ROLLBACK GPT-4O-MINI' as info;

SELECT 
    '📊 CONFIGURAÇÃO GLOBAL' as categoria,
    'ai_global_config' as tabela,
    COUNT(*) as total,
    'gpt-4o-mini' as modelo_ativo
FROM ai_global_config 
WHERE is_active = true

UNION ALL

SELECT 
    '📱 INTEGRAÇÕES WHATSAPP' as categoria,
    'whatsapp_integrations' as tabela,
    COUNT(*) as total,
    STRING_AGG(DISTINCT ia_model, ', ') as modelo_ativo
FROM whatsapp_integrations 
WHERE ia_model IS NOT NULL;

-- ================================
-- PASSO 4: LOG DO ROLLBACK
-- ================================

-- Registrar log do rollback
INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', -- Domínio Pizzas
    'SYSTEM',
    'ADMIN',
    'ROLLBACK COMPLETO: Sistema revertido para GPT-4o-mini. Todas as configurações e integrações foram revertidas.',
    'gpt4o_rollback',
    NOW()
);

-- ================================
-- MENSAGEM DE SUCESSO
-- ================================

SELECT 
    '🔄 ROLLBACK GPT-4O-MINI CONCLUÍDO COM SUCESSO!' as resultado,
    'Todos os sistemas foram revertidos para GPT-4o-mini' as detalhes,
    NOW() as data_rollback;
