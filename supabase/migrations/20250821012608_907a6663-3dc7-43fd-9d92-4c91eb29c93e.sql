-- PAUSAR IA EM TODAS AS EMPRESAS PARA ESTE NÚMERO ESPECÍFICO
UPDATE whatsapp_chats 
SET ai_paused = true, 
    updated_at = NOW()
WHERE contact_phone = '556993910380@s.whatsapp.net'
AND ai_paused = false;

-- Log da operação
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
    'FIX CRÍTICO: Pausando IA em TODAS as empresas para número 556993910380 que estava causando respostas mesmo pausado',
    'system_fix_applied',
    NOW()
);