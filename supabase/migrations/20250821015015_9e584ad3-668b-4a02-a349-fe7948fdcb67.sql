-- 🚫 DESATIVAR TODAS AS INTEGRAÇÕES WHATSAPP TEMPORARIAMENTE
UPDATE whatsapp_integrations 
SET token = NULL,
    host = NULL
WHERE token IS NOT NULL OR host IS NOT NULL;

-- Verificar o que foi desativado
SELECT 
    id,
    company_id,
    instance_key,
    CASE WHEN token IS NULL THEN 'DESATIVADO' ELSE 'AINDA_ATIVO' END as token_status,
    CASE WHEN host IS NULL THEN 'DESATIVADO' ELSE 'AINDA_ATIVO' END as host_status
FROM whatsapp_integrations
ORDER BY created_at DESC
LIMIT 10;

-- Log final
INSERT INTO public.ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'ADMIN', 
    '🚫 TODAS INTEGRAÇÕES WHATSAPP DESATIVADAS: Tokens e hosts removidos temporariamente',
    'system_whatsapp_disabled',
    now()
);