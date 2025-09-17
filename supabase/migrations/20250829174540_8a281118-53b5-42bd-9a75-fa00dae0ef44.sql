-- 🚨 CORREÇÃO CRÍTICA: Garantir uso de horários dinâmicos no WhatsApp

-- 1. Forçar uso da edge function ai-chat-direct (desabilitar modo direto)
UPDATE ai_agent_assistants 
SET 
    use_direct_mode = false,  -- Força uso da edge function ai-chat-direct com horários dinâmicos
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 2. Log da correção crítica
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
    '🚨 CORREÇÃO HORÁRIOS DINÂMICOS: use_direct_mode = false - Sistema agora calculará horários em TEMPO REAL. Perguntas como "vocês estão abertos?" serão respondidas corretamente baseado no horário atual.',
    'dynamic_hours_fix',
    NOW()
);

-- 3. Verificar se configuração foi aplicada
SELECT 
    'CONFIGURAÇÃO APLICADA' as status,
    use_direct_mode,
    is_active,
    bot_name,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';