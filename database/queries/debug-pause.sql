-- Verificar todos os chats recentes
SELECT 
  chat_id, 
  contact_phone, 
  ai_paused,
  updated_at,
  contact_name
FROM whatsapp_chats 
ORDER BY updated_at DESC 
LIMIT 10;

-- Verificar chats com números similares ao testado
SELECT 
  chat_id, 
  contact_phone, 
  ai_paused,
  company_id
FROM whatsapp_chats 
WHERE contact_phone LIKE '%2254%' 
   OR chat_id LIKE '%2254%'
   OR contact_phone LIKE '%69992254080%'
   OR chat_id LIKE '%69992254080%';

-- Verificar todos os chats pausados
SELECT 
  chat_id, 
  contact_phone, 
  ai_paused,
  company_id,
  updated_at
FROM whatsapp_chats 
WHERE ai_paused = true
ORDER BY updated_at DESC;