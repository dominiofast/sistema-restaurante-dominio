-- DIAGNÓSTICO: Por que o cashback não está sendo gerado?
-- Execute este script para identificar o problema

-- 1. VERIFICAR CONFIGURAÇÃO DE CASHBACK DA EMPRESA
SELECT 
    'CONFIGURAÇÃO DE CASHBACK' as tipo_verificacao,
    cc.company_id,
    cc.percentual_cashback,
    cc.valor_minimo_compra,
    cc.is_active,
    cc.activated_at,
    cc.created_at,
    cc.updated_at
FROM cashback_config cc
ORDER BY cc.company_id;

-- 2. VERIFICAR SE EXISTE CONFIGURAÇÃO PARA TODAS AS EMPRESAS
SELECT 
    'EMPRESAS SEM CONFIGURAÇÃO' as tipo_verificacao,
    c.id as company_id,
    c.name as company_name,
    'SEM CONFIGURAÇÃO DE CASHBACK' as status
FROM companies c
LEFT JOIN cashback_config cc ON c.id = cc.company_id
WHERE cc.id IS NULL;

-- 3. VERIFICAR PEDIDOS RECENTES E SE GERARAM CASHBACK
SELECT 
    'PEDIDOS RECENTES' as tipo_verificacao,
    p.id as pedido_id,
    p.numero_pedido,
    p.company_id,
    p.nome as cliente_nome,
    p.telefone as cliente_telefone,
    p.total as valor_pedido,
    p.created_at as data_pedido,
    CASE 
        WHEN ct.id IS NOT NULL THEN 'SIM - Gerou cashback'
        ELSE 'NÃO - Não gerou cashback'
    END as gerou_cashback,
    ct.valor as valor_cashback_gerado,
    ct.created_at as data_cashback
FROM pedidos p
LEFT JOIN cashback_transactions ct ON 
    p.id = ct.pedido_id AND 
    ct.tipo = 'credito'
WHERE p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY p.created_at DESC
LIMIT 20;

-- 4. VERIFICAR SE O TRIGGER ESTÁ ATIVO
SELECT 
    'TRIGGERS ATIVOS' as tipo_verificacao,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos' 
  AND trigger_name LIKE '%cashback%';

-- 5. VERIFICAR FUNÇÃO DE PROCESSAMENTO DE CASHBACK
SELECT 
    'FUNÇÃO CASHBACK' as tipo_verificacao,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%cashback%' 
  AND routine_type = 'FUNCTION';

-- 6. VERIFICAR SE HÁ PROBLEMAS NA TABELA DE TRANSAÇÕES
SELECT 
    'TRANSAÇÕES DE CASHBACK' as tipo_verificacao,
    COUNT(*) as total_transacoes,
    COUNT(CASE WHEN tipo = 'credito' THEN 1 END) as creditos,
    COUNT(CASE WHEN tipo = 'debito' THEN 1 END) as debitos,
    SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END) as total_creditos,
    SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END) as total_debitos,
    MIN(created_at) as primeira_transacao,
    MAX(created_at) as ultima_transacao
FROM cashback_transactions;

-- 7. VERIFICAR SALDOS ATUAIS DOS CLIENTES
SELECT 
    'SALDOS ATUAIS' as tipo_verificacao,
    cc.company_id,
    cc.customer_phone,
    cc.customer_name,
    cc.saldo_disponivel,
    cc.saldo_total_acumulado,
    cc.updated_at as ultima_atualizacao
FROM customer_cashback cc
ORDER BY cc.updated_at DESC
LIMIT 10;

-- 8. VERIFICAR SE HÁ ERROS NO LOG
SELECT 
    'LOGS DE ERRO' as tipo_verificacao,
    log_level,
    message,
    created_at
FROM logs 
WHERE message LIKE '%cashback%' 
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 10;

-- 9. TESTE MANUAL: SIMULAR GERAÇÃO DE CASHBACK
-- (Execute apenas se quiser testar manualmente)
/*
-- Exemplo para testar manualmente (substitua os valores):
SELECT 
    'TESTE MANUAL' as tipo_verificacao,
    'Para testar, execute:' as instrucao,
    'SELECT safe_generate_cashback(''SEU_COMPANY_ID'', ''SEU_TELEFONE'', ''SEU_NOME'', 10.00, 123);' as comando_teste;
*/
