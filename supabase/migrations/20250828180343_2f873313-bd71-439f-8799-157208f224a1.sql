-- REATIVAÇÃO INTELIGENTE: Apenas modo direto
-- 1. Desativar bloqueio de emergência global
UPDATE public.app_settings 
SET value = 'false'
WHERE key = 'emergency_block_legacy_ai';

-- 2. Garantir que modo direto está ativo
UPDATE public.ai_agent_assistants 
SET use_direct_mode = true,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 3. Despausar chats para permitir modo direto
UPDATE public.whatsapp_chats 
SET ai_paused = false,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 4. MANTER ai_agent_config DESABILITADO (funções legadas bloqueadas)
UPDATE public.ai_agent_config 
SET is_active = false,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 5. Log da reativação inteligente
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
  'SMART_REACTIVATION',
  'REATIVAÇÃO INTELIGENTE: Apenas modo direto ativo. Funções legadas permanecem bloqueadas.',
  'smart_reactivation',
  now()
);