-- Debug específico para Vangleiza - última hora
-- Execute este script no Supabase SQL Editor

-- 1. Pedidos da última hora (qualquer nome parecido)
SELECT 
    'PEDIDOS ULTIMA HORA - VANGLEIZA' as secao,
    p.id,
    p.numero_pedido,
    p.nome,
    p.telefone,
    p.total,
    p.pagamento,
    p.observacoes,
    p.created_at,
    EXTRACT(EPOCH FROM (NOW() - p.created_at))/60 as minutos_atras
FROM pedidos p
WHERE (
    p.nome ILIKE '%vangleiza%' 
    OR p.nome ILIKE '%vang%'
    OR p.telefone LIKE '%vangleiza%'
)
AND p.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY p.created_at DESC;

-- 2. Todos os pedidos da última hora (para comparar)
SELECT 
    'TODOS PEDIDOS ULTIMA HORA' as secao,
    COUNT(*) as total_pedidos,
    MIN(created_at) as primeiro_pedido,
    MAX(created_at) as ultimo_pedido
FROM pedidos p
WHERE p.created_at >= NOW() - INTERVAL '1 hour';

-- 3. Últimos 5 pedidos (qualquer cliente)
SELECT 
    'ULTIMOS 5 PEDIDOS' as secao,
    p.id,
    p.numero_pedido,
    p.nome,
    p.telefone,
    p.created_at,
    EXTRACT(EPOCH FROM (NOW() - p.created_at))/60 as minutos_atras
FROM pedidos p
ORDER BY p.created_at DESC
LIMIT 5;

-- 4. Pagamentos Asaas da última hora
SELECT 
    'PAGAMENTOS ASAAS ULTIMA HORA' as secao,
    ap.payment_id,
    ap.customer_name,
    ap.customer_phone,
    ap.amount,
    ap.status,
    ap.created_at,
    EXTRACT(EPOCH FROM (NOW() - ap.created_at))/60 as minutos_atras
FROM asaas_payments ap
WHERE ap.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY ap.created_at DESC;

SELECT 'SCRIPT EXECUTADO COM SUCESSO' as resultado;