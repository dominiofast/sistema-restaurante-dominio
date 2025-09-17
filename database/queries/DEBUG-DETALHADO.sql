-- DEBUG MAIS DETALHADO - Execute uma consulta por vez

-- 1. VERIFICAR SE TRIGGERS EXISTEM E ESTÃO ATIVOS
SELECT 
    'TRIGGERS ATIVOS' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'pedidos'
AND trigger_name LIKE '%notify%';

-- 2. PROCURAR VANGLEIZA COM BUSCA AMPLA
SELECT 
    'BUSCA VANGLEIZA' as info,
    id,
    chat_id,
    contact_name,
    contact_phone,
    unread_count,
    last_message_time
FROM whatsapp_chats 
WHERE contact_name ILIKE '%vang%'
OR contact_name ILIKE '%leiza%'
OR contact_phone ILIKE '%vang%'
ORDER BY unread_count DESC, last_message_time DESC;

-- 3. VER TODOS CHATS COM UNREAD_COUNT > 0
SELECT 
    'CHATS NAO LIDOS' as info,
    contact_name,
    contact_phone,
    unread_count,
    last_message_time,
    LEFT(last_message, 50) as ultima_msg
FROM whatsapp_chats 
WHERE unread_count > 0
ORDER BY unread_count DESC, last_message_time DESC;

-- 4. VERIFICAR SE HÁ PEDIDOS PARA TESTAR
SELECT 
    'PEDIDOS TESTE' as info,
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    updated_at
FROM pedidos 
WHERE telefone IS NOT NULL
AND nome IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;

-- 5. VERIFICAR TODOS OS LOGS RECENTES (não só notificação)
SELECT 
    'TODOS LOGS' as info,
    created_at,
    message_type,
    customer_phone,
    LEFT(message_content, 80) as resumo
FROM ai_conversation_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;
