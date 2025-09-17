-- 🚫 REMOVER TRIGGERS RESTANTES QUE AINDA ESTÃO ENVIANDO NOTIFICAÇÕES

-- Desativar triggers restantes
DROP TRIGGER IF EXISTS trigger_notify_production ON public.pedidos;
DROP TRIGGER IF EXISTS trigger_notify_ready ON public.pedidos;

-- Verificar se ainda existem triggers
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled as enabled,
    'AINDA ATIVO' as status
FROM pg_trigger t 
JOIN pg_class c ON c.oid = t.tgrelid 
WHERE (t.tgname ILIKE '%whatsapp%' 
    OR t.tgname ILIKE '%notification%' 
    OR t.tgname ILIKE '%notify%'
    OR t.tgname ILIKE '%status%'
    OR t.tgname ILIKE '%production%'
    OR t.tgname ILIKE '%ready%')
AND c.relname IN ('pedidos', 'pedido_itens')
AND t.tgisinternal = false;

-- Log de sucesso
INSERT INTO public.ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'ADMIN', 
    '✅ TODOS OS TRIGGERS DE NOTIFICAÇÃO REMOVIDOS: Sistema não deve mais enviar respostas automáticas',
    'system_triggers_disabled',
    now()
);