-- 5. VERIFICAR LOGS RECENTES
SELECT 
    'LOGS RECENTES' as info,
    created_at,
    message_type,
    customer_phone,
    LEFT(message_content, 80) as resumo
FROM ai_conversation_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;
