-- Buscar empresa correta e criar chat pausado
INSERT INTO whatsapp_chats (
  chat_id,
  company_id,
  contact_phone,
  contact_name,
  ai_paused,
  last_message,
  last_message_time
)
SELECT 
  '5511999999999@s.whatsapp.net',
  id,
  '5511999999999',
  'Cliente Teste Pausado',
  true,
  'Chat pausado para teste',
  NOW()
FROM companies 
WHERE name ILIKE '%pizzas%' 
   OR slug ILIKE '%pizzas%'
   OR name ILIKE '%dominio%'
LIMIT 1;