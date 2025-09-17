-- 🚀 EXECUTAR MIGRAÇÃO GPT-5-MINI - VERSÃO RÁPIDA
-- Execute este script no SQL Editor do Supabase

-- ================================
-- MIGRAÇÃO RÁPIDA - EXECUTAR AGORA
-- ================================

-- 1. Atualizar configuração global
UPDATE ai_global_config 
SET 
    openai_model = 'gpt-5-mini-2025-08-07',
    max_tokens = 2000,
    updated_at = NOW()
WHERE is_active = true;

-- 2. Atualizar integrações WhatsApp
UPDATE whatsapp_integrations 
SET 
    ia_model = 'gpt-5-mini-2025-08-07',
    ia_temperature = 0.7,
    updated_at = NOW()
WHERE ia_model IS NOT NULL;

-- 3. Verificar resultado
SELECT 
    '🎉 MIGRAÇÃO CONCLUÍDA!' as status,
    NOW() as data_execucao;

-- 4. Mostrar configurações atualizadas
SELECT 
    '📊 CONFIGURAÇÃO GLOBAL' as tipo,
    openai_model,
    max_tokens,
    temperature
FROM ai_global_config 
WHERE is_active = true

UNION ALL

SELECT 
    '📱 INTEGRAÇÕES WHATSAPP' as tipo,
    ia_model,
    ia_temperature::text,
    'Atualizado' as status
FROM whatsapp_integrations 
WHERE ia_model IS NOT NULL
LIMIT 1;
