-- Debug específico para pedidos duplicados da Vangleiza
-- Investigar por que ainda estão sendo criados 2 pedidos

-- 1. Buscar todos os pedidos da Vangleiza recentes
SELECT 
    'PEDIDOS VANGLEIZA RECENTES' as info,
    id,
    numero_pedido,
    nome,
    telefone,
    total,
    pagamento,
    observacoes,
    created_at,
    updated_at,
    status
FROM pedidos 
WHERE (nome ILIKE '%vangleiza%' OR nome ILIKE '%vang%')
AND created_at >= CURRENT_DATE - INTERVAL '2 days'
ORDER BY created_at DESC;

-- 2. Verificar se há payment_id duplicado nas observações
SELECT 
    'VERIFICAÇÃO DE PAYMENT_ID DUPLICADO' as info,
    COUNT(*) as total_pedidos,
    observacoes,
    pagamento,
    STRING_AGG(id::text, ', ') as pedido_ids,
    STRING_AGG(created_at::text, ', ') as created_ats
FROM pedidos 
WHERE (nome ILIKE '%vangleiza%' OR nome ILIKE '%vang%')
AND created_at >= CURRENT_DATE - INTERVAL '2 days'
AND (observacoes IS NOT NULL OR pagamento IS NOT NULL)
GROUP BY observacoes, pagamento
HAVING COUNT(*) > 1;

-- 3. Verificar pagamentos Asaas da Vangleiza
SELECT 
    'PAGAMENTOS ASAAS VANGLEIZA' as info,
    payment_id,
    customer_phone,
    customer_name,
    amount,
    status,
    confirmed_at,
    created_at
FROM asaas_payments 
WHERE (customer_name ILIKE '%vangleiza%' OR customer_name ILIKE '%vang%')
AND created_at >= CURRENT_DATE - INTERVAL '2 days'
ORDER BY created_at DESC;

-- 4. Verificar logs de conversação da Vangleiza
SELECT 
    'LOGS VANGLEIZA' as info,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
FROM ai_conversation_logs 
WHERE (customer_name ILIKE '%vangleiza%' OR customer_name ILIKE '%vang%')
AND created_at >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 20;

-- 5. Verificar se há triggers ativos que podem estar criando pedidos
SELECT 
    'TRIGGERS ATIVOS' as info,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('pedidos', 'asaas_payments', 'pedido_itens')
AND trigger_schema = 'public';

-- 6. Verificar se a função recover-orphan-payments foi executada recentemente
SELECT 
    'LOGS RECOVER ORPHAN' as info,
    *
FROM ai_conversation_logs 
WHERE message_content ILIKE '%recover%'
OR message_content ILIKE '%orphan%'
OR message_content ILIKE '%recuper%'
AND created_at >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY created_at DESC;