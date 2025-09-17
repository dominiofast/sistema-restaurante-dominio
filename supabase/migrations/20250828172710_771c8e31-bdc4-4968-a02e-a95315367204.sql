-- Desabilitar configuração antiga da Domínio Pizzas para forçar uso exclusivo do modo direto
UPDATE public.ai_agent_config 
SET is_active = false 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Garantir que apenas o modo direto está ativo
UPDATE public.ai_agent_assistants 
SET use_direct_mode = true, is_active = true
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Log da alteração
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
  'ADMIN',
  'CONFIGURAÇÃO FORÇADA: Modo direto exclusivo ativado, configuração antiga desabilitada para eliminar respostas duplicadas',
  'system_config',
  now()
);