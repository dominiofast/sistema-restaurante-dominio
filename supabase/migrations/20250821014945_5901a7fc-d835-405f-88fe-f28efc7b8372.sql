-- 🚫 DESATIVAR TODOS OS TRIGGERS QUE FAZEM CHAMADAS HTTP OU AUTOMÁTICAS

-- 1. Trigger de auto-impressão (faz chamada HTTP)
DROP TRIGGER IF EXISTS auto_print_pedido_trigger ON public.pedidos;
DROP TRIGGER IF EXISTS trg_auto_print_pedido_insert ON public.pedidos;

-- 2. Trigger de sync para empresa-mãe (pode enviar notificações)
DROP TRIGGER IF EXISTS trigger_sync_pedido_to_parent ON public.pedidos;

-- 3. Verificar se ainda existem triggers ativos
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled as enabled,
    'AINDA_ATIVO' as status
FROM pg_trigger t 
JOIN pg_class c ON c.oid = t.tgrelid 
WHERE t.tgisinternal = false
AND c.relname IN ('pedidos', 'pedido_itens')
AND t.tgname NOT IN ('process_order_cashback', 'trigger_set_numero_pedido', 'update_pedidos_updated_at')
ORDER BY c.relname, t.tgname;

-- 4. Dropar função que faz chamadas HTTP automáticas
DROP FUNCTION IF EXISTS public.call_auto_print_edge_on_pedido_insert() CASCADE;

-- Log da operação
INSERT INTO public.ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'ADMIN', 
    '🚫 VARREDURA COMPLETA: Removidos triggers de auto-print e sync que faziam chamadas HTTP',
    'system_triggers_final_cleanup',
    now()
);