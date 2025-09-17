-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('whatsapp_messages', 'whatsapp_chats');

-- Contar registros em whatsapp_chats
SELECT COUNT(*) as total_chats FROM public.whatsapp_chats;

-- Contar registros em whatsapp_messages
SELECT COUNT(*) as total_messages FROM public.whatsapp_messages;

-- Ver últimos 5 chats
SELECT id, company_id, chat_id, contact_name, contact_phone, last_message, last_message_time
FROM public.whatsapp_chats
ORDER BY created_at DESC
LIMIT 5;

-- Ver últimas 5 mensagens
SELECT id, company_id, chat_id, contact_name, message_content, is_from_me, timestamp
FROM public.whatsapp_messages
ORDER BY created_at DESC
LIMIT 5; 