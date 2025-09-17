-- PAUSA TOTAL IMEDIATA - Problema persiste
UPDATE public.whatsapp_chats 
SET ai_paused = true,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Desabilitar modo direto temporariamente
UPDATE public.ai_agent_assistants 
SET use_direct_mode = false,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Log do problema crítico
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
  'CRITICAL_BUG',
  'PROBLEMA CRÍTICO: Mensagem padrão persiste mesmo com todos os bloqueios. Investigação necessária.',
  'critical_bug',
  now()
);