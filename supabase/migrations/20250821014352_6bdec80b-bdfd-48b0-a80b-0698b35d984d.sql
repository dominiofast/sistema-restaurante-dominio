-- 🚫 DESATIVAR TRIGGERS DE NOTIFICAÇÃO DE STATUS
-- Estes triggers enviam notificações automáticas quando o status do pedido muda

-- 1. Dropar trigger de notificação de produção
DROP TRIGGER IF EXISTS notify_production_status ON public.pedidos;

-- 2. Dropar trigger de notificação de pronto/entregue  
DROP TRIGGER IF EXISTS notify_ready_status ON public.pedidos;

-- 3. Dropar trigger de notificação de confirmação
DROP TRIGGER IF EXISTS enviar_confirmacao_nova ON public.pedidos;

-- 4. Verificar se há outros triggers relacionados a WhatsApp
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled as enabled
FROM pg_trigger t 
JOIN pg_class c ON c.oid = t.tgrelid 
WHERE (t.tgname ILIKE '%whatsapp%' 
    OR t.tgname ILIKE '%notification%' 
    OR t.tgname ILIKE '%notify%'
    OR t.tgname ILIKE '%status%')
AND c.relname IN ('pedidos', 'pedido_itens')
AND t.tgisinternal = false;

-- Log da operação
INSERT INTO public.ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'ADMIN', 
    '🚫 TRIGGERS DE NOTIFICAÇÃO DESATIVADOS: Triggers de mudança de status que enviam WhatsApp foram removidos',
    'system_notification_disable',
    now()
);