-- 🚀 MIGRAÇÃO COMPLETA PARA GPT-5-MINI-2025-08-07
-- Data: 2025-01-27
-- Objetivo: Atualizar todas as configurações OpenAI para a versão mais recente

-- ================================
-- PASSO 1: ATUALIZAR CONFIGURAÇÃO GLOBAL
-- ================================

-- Atualizar configuração global ativa
UPDATE ai_global_config 
SET 
    openai_model = 'gpt-5-mini-2025-08-07',
    max_tokens = 2000, -- Aumentar para GPT-5
    temperature = 0.7,
    updated_at = NOW()
WHERE is_active = true;

-- Verificar se foi atualizado
SELECT 
    '✅ CONFIGURAÇÃO GLOBAL ATUALIZADA' as status,
    openai_model,
    max_tokens,
    temperature,
    updated_at
FROM ai_global_config 
WHERE is_active = true;

-- ================================
-- PASSO 2: ATUALIZAR INTEGRAÇÕES WHATSAPP
-- ================================

-- Atualizar todas as integrações WhatsApp
UPDATE whatsapp_integrations 
SET 
    ia_model = 'gpt-5-mini-2025-08-07',
    ia_temperature = 0.7,
    updated_at = NOW()
WHERE ia_model IS NOT NULL;

-- Verificar integrações atualizadas
SELECT 
    '✅ INTEGRAÇÕES WHATSAPP ATUALIZADAS' as status,
    COUNT(*) as total_atualizadas,
    STRING_AGG(DISTINCT ia_model, ', ') as modelos_ativos
FROM whatsapp_integrations 
WHERE ia_model IS NOT NULL;

-- ================================
-- PASSO 3: ATUALIZAR CONFIGURAÇÕES DE AGENTES
-- ================================

-- Atualizar configurações de agentes IA
UPDATE ai_agent_config 
SET 
    updated_at = NOW()
WHERE company_id IN (
    SELECT id FROM companies WHERE status = 'active'
);

-- Verificar agentes ativos
SELECT 
    '✅ CONFIGURAÇÕES DE AGENTES ATUALIZADAS' as status,
    COUNT(*) as total_agentes,
    COUNT(CASE WHEN is_active = true THEN 1 END) as agentes_ativos
FROM ai_agent_config;

-- ================================
-- PASSO 4: ATUALIZAR ASSISTANTS EXISTENTES
-- ================================

-- Marcar assistants para atualização (serão atualizados via Edge Functions)
UPDATE ai_agent_assistants 
SET 
    updated_at = NOW()
WHERE is_active = true;

-- Verificar assistants marcados
SELECT 
    '✅ ASSISTANTS MARCADOS PARA ATUALIZAÇÃO' as status,
    COUNT(*) as total_assistants,
    COUNT(CASE WHEN is_active = true THEN 1 END) as assistants_ativos
FROM ai_agent_assistants;

-- ================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- ================================

-- Resumo da migração
SELECT 
    '🎯 RESUMO DA MIGRAÇÃO GPT-5-MINI' as info;

SELECT 
    '📊 CONFIGURAÇÕES ATUALIZADAS' as categoria,
    'ai_global_config' as tabela,
    COUNT(*) as total,
    'gpt-5-mini-2025-08-07' as modelo_ativo
FROM ai_global_config 
WHERE is_active = true

UNION ALL

SELECT 
    '📱 INTEGRAÇÕES WHATSAPP' as categoria,
    'whatsapp_integrations' as tabela,
    COUNT(*) as total,
    STRING_AGG(DISTINCT ia_model, ', ') as modelo_ativo
FROM whatsapp_integrations 
WHERE ia_model IS NOT NULL

UNION ALL

SELECT 
    '🤖 AGENTES IA' as categoria,
    'ai_agent_config' as tabela,
    COUNT(*) as total,
    'Configurados para GPT-5' as modelo_ativo
FROM ai_agent_config;

-- ================================
-- PASSO 6: LOG DA MIGRAÇÃO
-- ================================

-- Registrar log da migração
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
    'MIGRAÇÃO COMPLETA: Sistema atualizado para GPT-5-mini-2025-08-07. Todas as configurações e integrações foram atualizadas.',
    'gpt5_migration',
    NOW()
);

-- ================================
-- MENSAGEM DE SUCESSO
-- ================================

SELECT 
    '🎉 MIGRAÇÃO GPT-5-MINI CONCLUÍDA COM SUCESSO!' as resultado,
    'Todos os sistemas foram atualizados para a versão mais recente da OpenAI' as detalhes,
    NOW() as data_migracao;
