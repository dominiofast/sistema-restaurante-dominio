-- VERIFICAR STATUS ATUAL DO CASHBACK
-- Execute este script para ver se está tudo funcionando

-- 1. CONFIGURAÇÕES ATIVAS
SELECT 
    'CONFIGURAÇÕES' as tipo,
    c.name as empresa,
    cc.percentual_cashback || '%' as percentual,
    'R$ ' || cc.valor_minimo_compra as valor_minimo,
    CASE WHEN cc.is_active THEN 'ATIVO' ELSE 'INATIVO' END as status
FROM cashback_config cc
JOIN companies c ON cc.company_id = c.id
ORDER BY c.name;

-- 2. ÚLTIMOS PEDIDOS E CASHBACK
SELECT 
    'ÚLTIMOS PEDIDOS' as tipo,
    p.numero_pedido,
    p.nome as cliente,
    'R$ ' || p.total as valor,
    p.created_at as data,
    CASE 
        WHEN ct.id IS NOT NULL THEN 'SIM - R$ ' || ct.valor
        ELSE 'NÃO'
    END as cashback_gerado
FROM pedidos p
LEFT JOIN cashback_transactions ct ON 
    p.id = ct.pedido_id AND 
    ct.tipo = 'credito'
WHERE p.created_at >= NOW() - INTERVAL '3 days'
ORDER BY p.created_at DESC
LIMIT 10;

-- 3. TRIGGER STATUS
SELECT 
    'TRIGGER' as tipo,
    trigger_name,
    CASE WHEN trigger_name IS NOT NULL THEN 'ATIVO' ELSE 'INATIVO' END as status
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos' 
  AND trigger_name = 'process_order_cashback';

-- 4. FUNÇÃO STATUS
SELECT 
    'FUNÇÃO' as tipo,
    routine_name,
    CASE WHEN routine_name IS NOT NULL THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status
FROM information_schema.routines 
WHERE routine_name = 'process_cashback_for_order' 
  AND routine_type = 'FUNCTION';

-- 5. SALDOS ATUAIS
SELECT 
    'SALDOS' as tipo,
    c.name as empresa,
    cc.customer_name as cliente,
    'R$ ' || cc.saldo_disponivel as saldo_disponivel,
    cc.updated_at as ultima_atualizacao
FROM customer_cashback cc
JOIN companies c ON cc.company_id = c.id
ORDER BY cc.updated_at DESC
LIMIT 5;
