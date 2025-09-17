-- DEBUG DOS PROBLEMAS NO CHAT
-- Execute uma consulta por vez no SQL Editor

-- 1. VERIFICAR SE NOTIFICAÇÕES ESTÃO SENDO SALVAS (últimas 2 horas)
SELECT 
    'NOTIFICACOES SALVAS' as tipo,
    message_id,
    contact_name,
    contact_phone,
    LEFT(message_content, 80) as mensagem_resumo,
    is_from_me,
    status,
    timestamp
FROM whatsapp_messages 
WHERE message_id LIKE 'notify_%'
AND timestamp > NOW() - INTERVAL '2 hours'
ORDER BY timestamp DESC
LIMIT 10;

-- 2. VERIFICAR LOGS DOS TRIGGERS (últimas 2 horas)
SELECT 
    'LOGS TRIGGERS' as tipo,
    created_at,
    message_type,
    customer_phone,
    customer_name,
    LEFT(message_content, 100) as mensagem_resumo
FROM ai_conversation_logs 
WHERE message_type IN (
    'production_status_change',
    'production_notification_sent',
    'ready_status_change', 
    'ready_notification_sent',
    'production_notification_error',
    'ready_notification_error'
)
AND created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC
LIMIT 10;

-- 3. VERIFICAR PROBLEMA ESPECÍFICO DA VANGLEIZA
SELECT 
    'VANGLEIZA CHAT' as tipo,
    id,
    chat_id,
    contact_name,
    contact_phone,
    unread_count,
    last_message,
    last_message_time,
    updated_at
FROM whatsapp_chats 
WHERE LOWER(contact_name) LIKE '%vangleiza%'
OR contact_phone LIKE '%vangleiza%'
OR chat_id LIKE '%vangleiza%';

-- 4. VERIFICAR MENSAGENS DA VANGLEIZA (últimas 10)
SELECT 
    'VANGLEIZA MENSAGENS' as tipo,
    message_id,
    message_content,
    is_from_me,
    status,
    timestamp,
    chat_id
FROM whatsapp_messages 
WHERE LOWER(contact_name) LIKE '%vangleiza%'
OR chat_id IN (
    SELECT chat_id FROM whatsapp_chats 
    WHERE LOWER(contact_name) LIKE '%vangleiza%'
)
ORDER BY timestamp DESC
LIMIT 10;

-- 5. VERIFICAR PEDIDOS RECENTES COM MUDANÇA DE STATUS
SELECT 
    'PEDIDOS RECENTES' as tipo,
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    company_id,
    updated_at
FROM pedidos 
WHERE updated_at > NOW() - INTERVAL '2 hours'
ORDER BY updated_at DESC
LIMIT 5;
