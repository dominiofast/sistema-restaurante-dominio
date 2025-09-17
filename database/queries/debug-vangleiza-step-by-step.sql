-- EXECUTE CADA QUERY SEPARADAMENTE NO SUPABASE
-- Copie e cole UMA query por vez

-- QUERY 1: Verificar se há pedidos da Vangleiza na última hora
SELECT 
    'PEDIDOS VANGLEIZA ULTIMA HORA' as info,
    p.id,
    p.numero_pedido,
    p.nome,
    p.telefone,
    p.total,
    p.pagamento,
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

-- ========================================
-- QUERY 2: Contar todos os pedidos da última hora
-- SELECT 
--     'TOTAL PEDIDOS ULTIMA HORA' as info,
--     COUNT(*) as total_pedidos,
--     MIN(created_at) as primeiro_pedido,
--     MAX(created_at) as ultimo_pedido
-- FROM pedidos p
-- WHERE p.created_at >= NOW() - INTERVAL '1 hour';

-- ========================================
-- QUERY 3: Ver últimos 5 pedidos de qualquer cliente
-- SELECT 
--     'ULTIMOS 5 PEDIDOS' as info,
--     p.id,
--     p.numero_pedido,
--     p.nome,
--     p.telefone,
--     p.created_at,
--     EXTRACT(EPOCH FROM (NOW() - p.created_at))/60 as minutos_atras
-- FROM pedidos p
-- ORDER BY p.created_at DESC
-- LIMIT 5;

-- ========================================
-- QUERY 4: Verificar pagamentos Asaas da última hora
-- SELECT 
--     'PAGAMENTOS ASAAS ULTIMA HORA' as info,
--     ap.payment_id,
--     ap.customer_name,
--     ap.customer_phone,
--     ap.amount,
--     ap.status,
--     ap.created_at,
--     EXTRACT(EPOCH FROM (NOW() - ap.created_at))/60 as minutos_atras
-- FROM asaas_payments ap
-- WHERE ap.created_at >= NOW() - INTERVAL '1 hour'
-- ORDER BY ap.created_at DESC;