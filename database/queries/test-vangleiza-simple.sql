-- Script de teste simples para verificar se as tabelas existem
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela pedidos existe e tem dados
SELECT 
    'TESTE: Tabela pedidos existe?' as teste,
    COUNT(*) as total_pedidos,
    MAX(created_at) as ultimo_pedido
FROM pedidos
LIMIT 1;

-- 2. Verificar se a tabela asaas_payments existe
SELECT 
    'TESTE: Tabela asaas_payments existe?' as teste,
    COUNT(*) as total_pagamentos,
    MAX(created_at) as ultimo_pagamento
FROM asaas_payments
LIMIT 1;

-- 3. Verificar se há algum pedido com nome parecido com Vangleiza (sem filtro de data)
SELECT 
    'TESTE: Pedidos com Vangleiza (todos os tempos)' as teste,
    COUNT(*) as total_encontrados
FROM pedidos p
WHERE p.nome ILIKE '%vangleiza%'
LIMIT 1;

-- 4. Verificar últimos 10 pedidos (qualquer cliente)
SELECT 
    'ULTIMOS 10 PEDIDOS' as info,
    p.id,
    p.numero_pedido,
    p.nome,
    p.telefone,
    p.total,
    p.created_at
FROM pedidos p
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Verificar se a tabela ai_conversation_logs existe
SELECT 
    'TESTE: Tabela ai_conversation_logs existe?' as teste,
    COUNT(*) as total_logs
FROM ai_conversation_logs
LIMIT 1;

SELECT '=== TESTE CONCLUÍDO ===' as resultado;