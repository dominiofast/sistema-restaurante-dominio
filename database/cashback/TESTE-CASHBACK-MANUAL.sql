-- TESTE MANUAL: Verificar se o cashback está funcionando
-- Execute este script para testar

-- 1. VERIFICAR CONFIGURAÇÕES ATIVAS
SELECT 
    'CONFIGURAÇÕES ATIVAS' as tipo,
    c.name as empresa,
    cc.percentual_cashback || '%' as percentual,
    'R$ ' || cc.valor_minimo_compra as valor_minimo,
    CASE WHEN cc.is_active THEN 'ATIVO' ELSE 'INATIVO' END as status
FROM cashback_config cc
JOIN companies c ON cc.company_id = c.id
WHERE cc.is_active = true
ORDER BY c.name;

-- 2. VERIFICAR SE EXISTEM PEDIDOS RECENTES
SELECT 
    'PEDIDOS RECENTES' as tipo,
    COUNT(*) as total_pedidos,
    MIN(created_at) as pedido_mais_antigo,
    MAX(created_at) as pedido_mais_recente
FROM pedidos 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 3. VERIFICAR TRANSAÇÕES DE CASHBACK
SELECT 
    'TRANSAÇÕES CASHBACK' as tipo,
    COUNT(*) as total_transacoes,
    COUNT(CASE WHEN tipo = 'credito' THEN 1 END) as creditos,
    COUNT(CASE WHEN tipo = 'debito' THEN 1 END) as debitos,
    SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END) as total_creditos,
    SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END) as total_debitos
FROM cashback_transactions;

-- 4. VERIFICAR SALDOS ATUAIS
SELECT 
    'SALDOS ATUAIS' as tipo,
    COUNT(*) as total_clientes,
    SUM(saldo_disponivel) as saldo_total_disponivel,
    SUM(saldo_total_acumulado) as saldo_total_acumulado
FROM customer_cashback;

-- 5. TESTE: SIMULAR CASHBACK PARA UMA EMPRESA
-- (Substitua os valores pelos dados reais da sua empresa)
/*
-- Exemplo de teste manual (descomente e ajuste os valores):
SELECT 
    'TESTE MANUAL' as tipo,
    'Para testar, execute:' as instrucao,
    'SELECT safe_generate_cashback(''SEU_COMPANY_ID'', ''SEU_TELEFONE'', ''SEU_NOME'', 10.00, 123);' as comando;

-- Ou use a função reset_and_credit_cashback:
-- SELECT reset_and_credit_cashback('SEU_COMPANY_ID', 'SEU_TELEFONE', 'SEU_NOME', 10.00, 123);
*/

-- 6. VERIFICAR SE AS FUNÇÕES EXISTEM
SELECT 
    'FUNÇÕES DISPONÍVEIS' as tipo,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%cashback%' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 7. VERIFICAR TRIGGERS ATIVOS
SELECT 
    'TRIGGERS ATIVOS' as tipo,
    trigger_name,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos';
