-- 🚨 ATIVAR HORÁRIOS DINÂMICOS PARA TODAS AS LOJAS

-- 1. Ativar horários dinâmicos para TODAS as empresas ativas
UPDATE ai_agent_assistants 
SET 
    use_direct_mode = false,  -- Força uso da edge function com horários dinâmicos
    updated_at = NOW()
WHERE is_active = true;

-- 2. Log da ativação global
INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) 
SELECT 
    company_id,
    'SYSTEM',
    'ADMIN',
    '🌍 HORÁRIOS DINÂMICOS GLOBAIS: Ativado para todas as lojas. Sistema agora calcula horários em tempo real para perguntas como "vocês estão abertos?"',
    'global_dynamic_hours_activation',
    NOW()
FROM ai_agent_assistants 
WHERE is_active = true;

-- 3. Verificar configuração final
SELECT 
    c.name as empresa,
    c.slug,
    aaa.use_direct_mode,
    CASE 
        WHEN aaa.use_direct_mode = false THEN '✅ Horários dinâmicos ativados'
        ELSE '❌ Problema na ativação'
    END as status
FROM companies c
JOIN ai_agent_assistants aaa ON aaa.company_id = c.id
WHERE aaa.is_active = true
ORDER BY c.name;