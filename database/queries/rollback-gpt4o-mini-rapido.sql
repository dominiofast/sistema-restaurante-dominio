-- 🔄 ROLLBACK RÁPIDO PARA GPT-4O-MINI
-- Execute este script no SQL Editor do Supabase

-- ================================
-- ROLLBACK RÁPIDO - EXECUTAR AGORA
-- ================================

-- 1. Reverter configuração global
UPDATE ai_global_config 
SET 
    openai_model = 'gpt-4o-mini',
    max_tokens = 1000,
    updated_at = NOW()
WHERE is_active = true;

-- 2. Reverter integrações WhatsApp
UPDATE whatsapp_integrations 
SET 
    ia_model = 'gpt-4o-mini',
    ia_temperature = 0.7,
    updated_at = NOW()
WHERE ia_model IS NOT NULL;

-- 3. Verificar resultado
SELECT 
    '🔄 ROLLBACK CONCLUÍDO!' as status,
    NOW() as data_execucao;

-- 4. Mostrar configurações revertidas
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
    'Revertido' as status
FROM whatsapp_integrations 
WHERE ia_model IS NOT NULL
LIMIT 1;
