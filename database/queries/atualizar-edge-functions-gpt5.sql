-- 🔧 ATUALIZAR EDGE FUNCTIONS PARA GPT-5-MINI
-- Data: 2025-01-27
-- Objetivo: Atualizar todas as Edge Functions para usar o novo modelo

-- ================================
-- PASSO 1: VERIFICAR FUNÇÕES QUE PRECISAM ATUALIZAÇÃO
-- ================================

-- Listar todas as Edge Functions que usam OpenAI
SELECT 
    '🔍 FUNÇÕES QUE PRECISAM ATUALIZAÇÃO' as info;

-- ================================
-- PASSO 2: ATUALIZAR ai-chat-direct
-- ================================

-- Esta função já está configurada para usar globalConfig.openai_model
-- Será atualizada automaticamente quando executarmos o script principal

-- ================================
-- PASSO 3: ATUALIZAR ai-processor
-- ================================

-- Esta função usa modelo hardcoded 'gpt-3.5-turbo'
-- Precisa ser atualizada para usar configuração global

-- ================================
-- PASSO 4: ATUALIZAR agente-ia-conversa
-- ================================

-- Esta função já usa GPT-5-mini-2025-08-07
-- Está na vanguarda! ✅

-- ================================
-- PASSO 5: ATUALIZAR generate-welcome-message
-- ================================

-- Esta função usa globalConfig.openai_model
-- Será atualizada automaticamente ✅

-- ================================
-- PASSO 6: ATUALIZAR create-new-assistant
-- ================================

-- Esta função usa 'gpt-4o-mini' hardcoded
-- Precisa ser atualizada para usar configuração global

-- ================================
-- VERIFICAÇÃO DE FUNÇÕES
-- ================================

SELECT 
    '📋 STATUS DAS EDGE FUNCTIONS' as info;

SELECT 
    '✅ FUNÇÕES ATUALIZADAS AUTOMATICAMENTE' as status,
    'ai-chat-direct' as funcao,
    'Usa globalConfig.openai_model' as detalhes

UNION ALL

SELECT 
    '✅ FUNÇÕES JÁ ATUALIZADAS' as status,
    'agente-ia-conversa' as funcao,
    'Já usa GPT-5-mini-2025-08-07' as detalhes

UNION ALL

SELECT 
    '✅ FUNÇÕES ATUALIZADAS AUTOMATICAMENTE' as status,
    'generate-welcome-message' as funcao,
    'Usa globalConfig.openai_model' as detalhes

UNION ALL

SELECT 
    '⚠️ FUNÇÕES QUE PRECISAM ATUALIZAÇÃO MANUAL' as status,
    'ai-processor' as funcao,
    'Usa gpt-3.5-turbo hardcoded' as detalhes

UNION ALL

SELECT 
    '⚠️ FUNÇÕES QUE PRECISAM ATUALIZAÇÃO MANUAL' as status,
    'create-new-assistant' as funcao,
    'Usa gpt-4o-mini hardcoded' as detalhes;

-- ================================
-- RECOMENDAÇÃO
-- ================================

SELECT 
    '💡 RECOMENDAÇÃO' as info,
    'Execute o script principal primeiro, depois atualize as Edge Functions que usam modelos hardcoded' as detalhes;
