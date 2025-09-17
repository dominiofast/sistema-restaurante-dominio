-- TESTE: Reativar APENAS modo direto para Domínio Pizzas
UPDATE public.ai_agent_assistants 
SET use_direct_mode = true,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Despausar chats do Domínio Pizzas para permitir modo direto
UPDATE public.whatsapp_chats 
SET ai_paused = false,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Log do teste
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
  'TEST',
  'TESTE: Reativado apenas modo direto. Funções legadas mantidas bloqueadas.',
  'direct_mode_test',
  now()
);