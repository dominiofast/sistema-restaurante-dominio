-- Testar se a migração foi aplicada corretamente
-- Verificar se a função identify_orphan_payments foi atualizada

-- 1. Verificar se a função existe e sua definição
SELECT 
    'FUNÇÃO IDENTIFY_ORPHAN_PAYMENTS' as info,
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'identify_orphan_payments';

-- 2. Testar a função para ver se está funcionando
SELECT 
    'TESTE DA FUNÇÃO' as info,
    payment_id,
    customer_phone,
    amount,
    has_matching_order
FROM identify_orphan_payments()
LIMIT 5;

-- 3. Verificar pedidos recentes com PIX
SELECT 
    'PEDIDOS PIX RECENTES' as info,
    id,
    numero_pedido,
    nome,
    telefone,
    total,
    pagamento,
    observacoes,
    created_at
FROM pedidos 
WHERE (pagamento ILIKE '%pix%' OR observacoes ILIKE '%pix%')
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se há pagamentos Asaas confirmados recentes
SELECT 
    'PAGAMENTOS ASAAS RECENTES' as info,
    payment_id,
    customer_phone,
    amount,
    status,
    confirmed_at
FROM asaas_payments 
WHERE status IN ('CONFIRMED', 'RECEIVED')
AND confirmed_at >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY confirmed_at DESC
LIMIT 10;