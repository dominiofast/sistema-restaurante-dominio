-- DESABILITAR COMPLETAMENTE QUALQUER RESPOSTA AUTOMÁTICA
-- Criar flag global de emergência
INSERT INTO app_settings (key, value)
VALUES ('emergency_ai_disabled', 'true')
ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = NOW();

-- Log da ação
INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone, 
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '556993910380',
    'ADMIN',
    'EMERGÊNCIA: IA desabilitada globalmente devido a problema persistente de resposta mesmo pausada',
    'emergency_ai_disabled',
    NOW()
);