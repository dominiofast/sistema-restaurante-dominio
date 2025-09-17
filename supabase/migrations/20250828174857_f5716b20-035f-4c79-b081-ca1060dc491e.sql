-- BLOQUEIO TOTAL: Pausar TODOS os chats do Domínio Pizzas
UPDATE public.whatsapp_chats 
SET ai_paused = true,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Log do bloqueio total
INSERT INTO public.ai_conversation_logs (
  company_id,
  customer_phone,
  customer_name,
  message_content,
  message_type,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'SYSTEM',
  'EMERGENCY',
  'BLOQUEIO TOTAL: Todos os chats pausados manualmente. Nenhuma IA deve responder.',
  'emergency_total_block',
  now()
);