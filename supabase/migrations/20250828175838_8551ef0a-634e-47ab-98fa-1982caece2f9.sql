-- PAUSA IMEDIATA - Voltaram as mensagens padrão!
UPDATE public.whatsapp_chats 
SET ai_paused = true,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Log do problema
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
  'PROBLEMA: Mensagens padrão voltaram mesmo com bloqueios ativos. Pausando novamente.',
  'emergency_reblock',
  now()
);