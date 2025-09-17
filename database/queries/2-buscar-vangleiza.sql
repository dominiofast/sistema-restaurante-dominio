-- 2. PROCURAR VANGLEIZA
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
