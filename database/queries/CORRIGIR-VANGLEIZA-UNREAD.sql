-- CORRIGIR PROBLEMA DA VANGLEIZA TRAVADA COMO NÃO LIDA

-- 1. PRIMEIRO: Ver o estado atual da Vangleiza
SELECT 
    'ESTADO ATUAL' as info,
    id,
    chat_id,
    contact_name,
    contact_phone,
    unread_count,
    last_message_time,
    updated_at
FROM whatsapp_chats 
WHERE LOWER(contact_name) LIKE '%vangleiza%';

-- 2. CORRIGIR: Zerar unread_count da Vangleiza
UPDATE whatsapp_chats 
SET unread_count = 0,
    updated_at = NOW()
WHERE LOWER(contact_name) LIKE '%vangleiza%';

-- 3. VERIFICAR: Se foi corrigido
SELECT 
    'APÓS CORREÇÃO' as info,
    id,
    chat_id,
    contact_name,
    contact_phone,
    unread_count,
    last_message_time,
    updated_at
FROM whatsapp_chats 
WHERE LOWER(contact_name) LIKE '%vangleiza%';
