-- Criar o chat pausado para o número de teste
INSERT INTO whatsapp_chats (
  chat_id,
  company_id,
  contact_phone,
  contact_name,
  ai_paused,
  last_message,
  last_message_time
) VALUES (
  '5511999999999@s.whatsapp.net',
  (SELECT id FROM companies WHERE slug = 'dominio-pizzas' LIMIT 1),
  '5511999999999',
  'Cliente Teste',
  true,
  'Chat pausado para teste',
  NOW()
);