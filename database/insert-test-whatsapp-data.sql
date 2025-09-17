-- Buscar company_id da primeira empresa
WITH first_company AS (
  SELECT id FROM public.companies LIMIT 1
)

-- Inserir chat de teste
INSERT INTO public.whatsapp_chats (
  company_id,
  chat_id,
  contact_name,
  contact_phone,
  last_message,
  last_message_time,
  unread_count
)
SELECT 
  id as company_id,
  '5511999887766@s.whatsapp.net' as chat_id,
  'João Cliente Teste' as contact_name,
  '+5511999887766' as contact_phone,
  'Olá, gostaria de fazer um pedido!' as last_message,
  NOW() - INTERVAL '5 minutes' as last_message_time,
  2 as unread_count
FROM first_company
ON CONFLICT (chat_id) DO UPDATE SET
  last_message = EXCLUDED.last_message,
  last_message_time = EXCLUDED.last_message_time,
  unread_count = whatsapp_chats.unread_count + EXCLUDED.unread_count;

-- Inserir mensagens de teste
WITH first_company AS (
  SELECT id FROM public.companies LIMIT 1
)
INSERT INTO public.whatsapp_messages (
  company_id,
  chat_id,
  contact_name,
  contact_phone,
  message_id,
  message_content,
  message_type,
  is_from_me,
  status,
  timestamp
)
SELECT 
  id as company_id,
  '5511999887766@s.whatsapp.net' as chat_id,
  'João Cliente Teste' as contact_name,
  '+5511999887766' as contact_phone,
  'msg_' || generate_series as message_id,
  CASE generate_series
    WHEN 1 THEN 'Olá, boa tarde!'
    WHEN 2 THEN 'Gostaria de fazer um pedido'
    WHEN 3 THEN 'Vocês tem pizza de calabresa?'
    WHEN 4 THEN 'Sim, temos! A grande está R$ 45,00'
    WHEN 5 THEN 'Perfeito! Quero uma grande de calabresa'
  END as message_content,
  'text' as message_type,
  CASE 
    WHEN generate_series IN (4) THEN true
    ELSE false
  END as is_from_me,
  'read' as status,
  NOW() - INTERVAL '10 minutes' + (generate_series || ' minutes')::INTERVAL as timestamp
FROM first_company, generate_series(1, 5)
ON CONFLICT (message_id) DO NOTHING;

-- Adicionar mais um chat
WITH first_company AS (
  SELECT id FROM public.companies LIMIT 1
)
INSERT INTO public.whatsapp_chats (
  company_id,
  chat_id,
  contact_name,
  contact_phone,
  last_message,
  last_message_time,
  unread_count
)
SELECT 
  id as company_id,
  '5521988776655@s.whatsapp.net' as chat_id,
  'Maria Silva' as contact_name,
  '+5521988776655' as contact_phone,
  'Obrigada!' as last_message,
  NOW() - INTERVAL '1 hour' as last_message_time,
  0 as unread_count
FROM first_company
ON CONFLICT (chat_id) DO UPDATE SET
  last_message = EXCLUDED.last_message,
  last_message_time = EXCLUDED.last_message_time;

-- Verificar dados inseridos
SELECT 'Total de chats:' as info, COUNT(*) as total FROM public.whatsapp_chats
UNION ALL
SELECT 'Total de mensagens:' as info, COUNT(*) as total FROM public.whatsapp_messages; 