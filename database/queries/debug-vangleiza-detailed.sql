-- Script para investigar duplicação de pedidos da Vangleiza
-- Executar este script para entender o que está causando os pedidos duplicados

-- 1. Verificar pedidos recentes da Vangleiza com detalhes completos
SELECT 
    p.id,
    p.numero_pedido,
    p.nome,
    p.telefone,
    p.status,
    p.total,
    p.observacoes,
    p.pagamento,
    p.created_at,
    p.updated_at,
    -- Extrair payment_id das observações se existir
    CASE 
        WHEN p.observacoes LIKE '%"id":%' THEN 
            regexp_replace(p.observacoes, '.*"id":"([^"]+)".*', '\1')
        WHEN p.pagamento LIKE '%pay_%' THEN 
            regexp_replace(p.pagamento, '.*(pay_[a-zA-Z0-9]+).*', '\1')
        ELSE 'N/A'
    END as extracted_payment_id
FROM pedidos p
WHERE (p.nome ILIKE '%vangleiza%' OR p.telefone LIKE '%vangleiza%')
    AND p.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY p.created_at DESC;

-- 2. Verificar pagamentos Asaas relacionados à Vangleiza
SELECT 
    ap.payment_id,
    ap.status,
    ap.amount,
    ap.customer_name,
    ap.customer_phone,
    ap.confirmed_at,
    ap.created_at,
    ap.updated_at,
    -- Verificar se existe pedido correspondente
    (
        SELECT COUNT(*) 
        FROM pedidos p 
        WHERE (p.observacoes LIKE '%' || ap.payment_id || '%' 
               OR p.pagamento LIKE '%' || ap.payment_id || '%')
    ) as pedidos_relacionados
FROM asaas_payments ap
WHERE (ap.customer_name ILIKE '%vangleiza%' OR ap.customer_phone LIKE '%vangleiza%')
    AND ap.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY ap.created_at DESC;

-- 3. Verificar logs de conversação relacionados à Vangleiza
SELECT 
    acl.message_type,
    acl.message_content,
    acl.customer_name,
    acl.customer_phone,
    acl.created_at
FROM ai_conversation_logs acl
WHERE (acl.customer_name ILIKE '%vangleiza%' 
       OR acl.customer_phone LIKE '%vangleiza%'
       OR acl.message_content ILIKE '%vangleiza%')
    AND acl.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY acl.created_at DESC;

-- 4. Verificar se há múltiplos triggers sendo executados
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table IN ('asaas_payments', 'pedidos')
    AND trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 5. Verificar execuções recentes da função recover-orphan-payments
SELECT 
    acl.message_content,
    acl.created_at
FROM ai_conversation_logs acl
WHERE acl.message_type = 'system'
    AND acl.message_content LIKE '%recover%orphan%'
    AND acl.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY acl.created_at DESC;

-- 6. Verificar se há pedidos com o mesmo payment_id
WITH payment_ids AS (
    SELECT 
        p.id,
        p.numero_pedido,
        p.nome,
        p.created_at,
        CASE 
            WHEN p.observacoes LIKE '%"id":%' THEN 
                regexp_replace(p.observacoes, '.*"id":"([^"]+)".*', '\1')
            WHEN p.pagamento LIKE '%pay_%' THEN 
                regexp_replace(p.pagamento, '.*(pay_[a-zA-Z0-9]+).*', '\1')
            ELSE NULL
        END as payment_id
    FROM pedidos p
    WHERE (p.nome ILIKE '%vangleiza%' OR p.telefone LIKE '%vangleiza%')
        AND p.created_at >= NOW() - INTERVAL '24 hours'
)
SELECT 
    payment_id,
    COUNT(*) as pedidos_count,
    STRING_AGG(numero_pedido::TEXT, ', ') as numeros_pedidos,
    STRING_AGG(id::TEXT, ', ') as pedido_ids
FROM payment_ids
WHERE payment_id IS NOT NULL
GROUP BY payment_id
HAVING COUNT(*) > 1;

-- 7. Verificar timing entre criação do pagamento e pedidos
SELECT 
    ap.payment_id,
    ap.created_at as pagamento_criado,
    ap.confirmed_at as pagamento_confirmado,
    p.id as pedido_id,
    p.numero_pedido,
    p.created_at as pedido_criado,
    EXTRACT(EPOCH FROM (p.created_at - ap.created_at)) as segundos_diferenca
FROM asaas_payments ap
JOIN pedidos p ON (
    p.observacoes LIKE '%' || ap.payment_id || '%' 
    OR p.pagamento LIKE '%' || ap.payment_id || '%'
)
WHERE (ap.customer_name ILIKE '%vangleiza%' OR p.nome ILIKE '%vangleiza%')
    AND ap.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY ap.created_at DESC, p.created_at DESC;

-- 8. Verificar se a função identify_orphan_payments está funcionando corretamente
SELECT 
    payment_id,
    customer_phone,
    amount,
    confirmed_at,
    has_matching_order,
    days_since_payment
FROM identify_orphan_payments()
WHERE customer_phone LIKE '%vangleiza%' OR payment_id IN (
    SELECT ap.payment_id 
    FROM asaas_payments ap 
    WHERE ap.customer_name ILIKE '%vangleiza%'
);

SELECT '=== FIM DO DEBUG VANGLEIZA ===' as status;