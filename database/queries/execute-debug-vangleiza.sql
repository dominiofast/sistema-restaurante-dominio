-- Script para executar debug da Vangleiza no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar pedidos recentes da Vangleiza
SELECT 
    'PEDIDOS VANGLEIZA RECENTES' as info,
    p.id,
    p.numero_pedido,
    p.nome,
    p.telefone,
    p.total,
    p.pagamento,
    p.observacoes,
    p.created_at,
    p.updated_at
FROM pedidos p
WHERE (p.nome ILIKE '%vangleiza%' OR p.telefone LIKE '%vangleiza%')
    AND p.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY p.created_at DESC;

-- 2. Verificar pagamentos Asaas relacionados
SELECT 
    'PAGAMENTOS ASAAS VANGLEIZA' as info,
    ap.payment_id,
    ap.customer_name,
    ap.customer_phone,
    ap.amount,
    ap.status,
    ap.created_at,
    ap.confirmed_at,
    -- Contar pedidos correspondentes
    (
        SELECT COUNT(*) 
        FROM pedidos p 
        WHERE (p.observacoes ILIKE '%' || ap.payment_id || '%'
               OR p.pagamento ILIKE '%' || ap.payment_id || '%')
    ) as pedidos_count
FROM asaas_payments ap
WHERE (ap.customer_name ILIKE '%vangleiza%' OR ap.customer_phone LIKE '%vangleiza%')
    AND ap.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY ap.created_at DESC;

-- 3. Verificar se há pedidos com o mesmo payment_id
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
    'PAYMENT_IDS DUPLICADOS' as info,
    payment_id,
    COUNT(*) as pedidos_count,
    STRING_AGG(numero_pedido::TEXT, ', ') as numeros_pedidos,
    STRING_AGG(id::TEXT, ', ') as pedido_ids
FROM payment_ids
WHERE payment_id IS NOT NULL
GROUP BY payment_id
HAVING COUNT(*) > 1;

-- 4. Verificar logs de conversação
SELECT 
    'LOGS VANGLEIZA' as info,
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
ORDER BY acl.created_at DESC
LIMIT 10;

-- 5. Verificar timing entre criação do pagamento e pedidos
SELECT
    'TIMING PAGAMENTO vs PEDIDO' as info,
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

SELECT '=== EXECUTE ESTE SCRIPT NO SUPABASE SQL EDITOR ===' as instrucao;