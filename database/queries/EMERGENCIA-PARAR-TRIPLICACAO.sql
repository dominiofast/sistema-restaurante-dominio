-- SCRIPT DE EMERGÊNCIA PARA PARAR TRIPLICAÇÃO DE PEDIDOS
-- Execute este script IMEDIATAMENTE no Supabase Dashboard > SQL Editor

-- 1. DESATIVAR TODOS OS TRIGGERS SUSPEITOS
DROP TRIGGER IF EXISTS trigger_auto_print_pedido ON public.pedidos CASCADE;
DROP TRIGGER IF EXISTS process_order_cashback ON public.pedidos CASCADE;
DROP TRIGGER IF EXISTS trigger_whatsapp_notification_after_items ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_whatsapp_after_items ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_send_whatsapp_notification_after_items ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_whatsapp_funcionando ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_whatsapp_primeiro_item ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_whatsapp_unico_final ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_confirmacao_limpa_final ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_confirmacao_nova ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS send_single_clean_confirmation ON pedidos CASCADE;
DROP TRIGGER IF EXISTS trigger_notify_production ON pedidos CASCADE;

-- 2. VERIFICAR SE REMOVEU OS TRIGGERS
SELECT 'TRIGGERS RESTANTES EM PEDIDOS:' as info;
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos' 
AND trigger_schema = 'public';

SELECT 'TRIGGERS RESTANTES EM PEDIDO_ITENS:' as info;
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'pedido_itens' 
AND trigger_schema = 'public';

-- 3. LOG DE EMERGÊNCIA
INSERT INTO ai_conversation_logs (
  company_id,
  customer_phone,
  customer_name,
  message_content,
  message_type,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'SYSTEM_EMERGENCY',
  'ANTI_TRIPLICATION',
  'EMERGÊNCIA: Todos os triggers suspeitos foram removidos para parar triplicação de pedidos. Função RPC anti-duplicação permanece ativa.',
  'emergency_trigger_removal',
  NOW()
);

-- 4. VERIFICAR FUNÇÃO RPC ANTI-DUPLICAÇÃO AINDA ATIVA
SELECT 'FUNÇÃO RPC ANTI-DUPLICAÇÃO:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'rpc_check_existing_order' 
AND routine_schema = 'public';

SELECT 'EMERGÊNCIA EXECUTADA - TRIPLICAÇÃO DEVE PARAR AGORA!' as status;