-- DEBUG PARA DUPLICAÇÃO PERSISTENTE
-- Investigar por que a duplicação ainda acontece mesmo após as correções

-- 1. VERIFICAR SE AS CORREÇÕES FORAM APLICADAS
SELECT 
  'VERIFICAÇÃO DAS CORREÇÕES APLICADAS' as info,
  'Triggers ativos em asaas_payments:' as check_type;

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'asaas_payments'
  AND trigger_schema = 'public'
ORDER BY trigger_name;

-- 2. VERIFICAR SE A FUNÇÃO ANTI-DUPLICAÇÃO EXISTE
SELECT 
  'FUNÇÕES ANTI-DUPLICAÇÃO' as info,
  routine_name,
  routine_type,
  created
FROM information_schema.routines
WHERE routine_name IN ('check_existing_order_before_create', 'rpc_check_existing_order')
ORDER BY routine_name;

-- 3. ANALISAR PEDIDOS VANGLEIZA RECENTES COM TIMESTAMPS PRECISOS
SELECT 
  'ANÁLISE TEMPORAL VANGLEIZA' as info,
  id,
  numero_pedido,
  nome,
  telefone,
  total,
  created_at,
  EXTRACT(EPOCH FROM created_at) as timestamp_epoch,
  LAG(created_at) OVER (ORDER BY created_at) as pedido_anterior,
  EXTRACT(EPOCH FROM created_at) - EXTRACT(EPOCH FROM LAG(created_at) OVER (ORDER BY created_at)) as diferenca_segundos,
  observacoes,
  pagamento
FROM pedidos 
WHERE (nome ILIKE '%vangleiza%' OR nome ILIKE '%vang%')
AND created_at >= NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- 4. VERIFICAR LOGS DE CONVERSAÇÃO PARA IDENTIFICAR PADRÕES
SELECT 
  'LOGS DE ANTI-DUPLICAÇÃO' as info,
  message_type,
  message_content,
  created_at,
  customer_phone
FROM ai_conversation_logs
WHERE message_type IN ('anti_duplicate_check', 'rpc_anti_duplicate_check', 'duplicate_prevention_success')
AND created_at >= NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- 5. VERIFICAR PAGAMENTOS ASAAS CORRESPONDENTES
SELECT 
  'PAGAMENTOS ASAAS VANGLEIZA' as info,
  payment_id,
  customer_phone,
  customer_name,
  amount,
  status,
  created_at,
  confirmed_at,
  EXTRACT(EPOCH FROM created_at) as payment_timestamp_epoch
FROM asaas_payments 
WHERE (customer_name ILIKE '%vangleiza%' OR customer_name ILIKE '%vang%')
AND created_at >= NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- 6. CORRELACIONAR PEDIDOS COM PAGAMENTOS (BUSCAR RACE CONDITIONS)
WITH pedidos_vangleiza AS (
  SELECT 
    id as pedido_id,
    numero_pedido,
    telefone,
    total,
    created_at as pedido_created_at,
    observacoes,
    pagamento
  FROM pedidos 
  WHERE (nome ILIKE '%vangleiza%' OR nome ILIKE '%vang%')
  AND created_at >= NOW() - INTERVAL '2 hours'
),
pagamentos_vangleiza AS (
  SELECT 
    payment_id,
    customer_phone,
    amount,
    created_at as payment_created_at,
    confirmed_at
  FROM asaas_payments 
  WHERE (customer_name ILIKE '%vangleiza%' OR customer_name ILIKE '%vang%')
  AND created_at >= NOW() - INTERVAL '2 hours'
)
SELECT 
  'CORRELAÇÃO PEDIDOS x PAGAMENTOS' as info,
  p.pedido_id,
  p.numero_pedido,
  p.telefone,
  p.total,
  p.pedido_created_at,
  pg.payment_id,
  pg.amount,
  pg.payment_created_at,
  pg.confirmed_at,
  EXTRACT(EPOCH FROM p.pedido_created_at) - EXTRACT(EPOCH FROM pg.payment_created_at) as diferenca_pedido_pagamento_segundos,
  CASE 
    WHEN p.observacoes ILIKE '%' || pg.payment_id || '%' OR p.pagamento ILIKE '%' || pg.payment_id || '%' THEN 'VINCULADO'
    ELSE 'NÃO VINCULADO'
  END as vinculacao_status
FROM pedidos_vangleiza p
FULL OUTER JOIN pagamentos_vangleiza pg ON p.telefone = pg.customer_phone AND ABS(p.total - pg.amount) <= 1.00
ORDER BY p.pedido_created_at DESC, pg.payment_created_at DESC;

-- 7. VERIFICAR SE HÁ MÚLTIPLAS CHAMADAS SIMULTÂNEAS (RACE CONDITION)
SELECT 
  'POSSÍVEL RACE CONDITION' as info,
  telefone,
  total,
  COUNT(*) as pedidos_simultaneos,
  MIN(created_at) as primeiro_pedido,
  MAX(created_at) as ultimo_pedido,
  EXTRACT(EPOCH FROM MAX(created_at)) - EXTRACT(EPOCH FROM MIN(created_at)) as janela_temporal_segundos,
  STRING_AGG(id::text, ', ' ORDER BY created_at) as pedido_ids
FROM pedidos 
WHERE (nome ILIKE '%vangleiza%' OR nome ILIKE '%vang%')
AND created_at >= NOW() - INTERVAL '2 hours'
GROUP BY telefone, total
HAVING COUNT(*) > 1
ORDER BY janela_temporal_segundos ASC;

-- 8. VERIFICAR LOGS DE SISTEMA RELACIONADOS
SELECT 
  'LOGS DE SISTEMA RELACIONADOS' as info,
  message_type,
  message_content,
  created_at,
  customer_phone
FROM ai_conversation_logs
WHERE (
  customer_phone LIKE '%vangleiza%' 
  OR customer_name ILIKE '%vangleiza%'
  OR message_content ILIKE '%vangleiza%'
)
AND created_at >= NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- 9. RESULTADO E RECOMENDAÇÕES
SELECT 
  'PRÓXIMOS PASSOS RECOMENDADOS' as info,
  'Se ainda há duplicação:' as step1,
  '1. Execute integrate-anti-duplicate-function.sql' as step2,
  '2. Atualize a edge function criar-pedido-publico' as step3,
  '3. Implemente debounce no frontend' as step4,
  '4. Monitore logs em tempo real' as step5;

SELECT 'DEBUG COMPLETO EXECUTADO - ANALISE OS RESULTADOS ACIMA' as status;