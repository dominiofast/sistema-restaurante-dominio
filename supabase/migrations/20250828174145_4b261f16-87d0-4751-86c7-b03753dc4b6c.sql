-- PARADA DE EMERGÊNCIA: Desabilitar TODAS as fontes de IA exceto modo direto

-- 1. Desabilitar TODAS as configurações ai_agent_config
UPDATE public.ai_agent_config 
SET is_active = false;

-- 2. Ativar EMERGÊNCIA GLOBAL para bloquear funções legadas  
INSERT INTO public.app_settings (key, value)
VALUES ('emergency_block_legacy_ai', 'true')
ON CONFLICT (key) DO UPDATE SET value = 'true';

-- 3. Log da emergência
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
  'PARADA DE EMERGÊNCIA: Todas as funções de IA legadas bloqueadas. Apenas ai-chat-direct permitido.',
  'emergency_stop',
  now()
);