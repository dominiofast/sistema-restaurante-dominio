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
