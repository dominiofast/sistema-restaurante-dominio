-- CORRIGIR SALDO DO CLEBER - GERAR CASHBACK DO PEDIDO #556
-- Pedido #556: subtotal R$ 63,57 = cashback R$ 6,36

-- 1. Gerar cashback que deveria ter sido criado
INSERT INTO cashback_transactions (
    company_id,
    customer_phone,
    customer_name,
    tipo,
    valor,
    descricao,
    pedido_id
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '69992254080',
    'Cleber Ruiz Camargo',
    'credito',
    6.36,
    'Cashback do pedido #556 (correção manual)',
    556
);

-- 2. Atualizar saldo do cliente
UPDATE customer_cashback 
SET 
    saldo_disponivel = saldo_disponivel + 6.36,
    saldo_total_acumulado = saldo_total_acumulado + 6.36,
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' 
AND customer_phone = '69992254080';

-- 3. Verificar resultado
SELECT 'Saldo corrigido! Agora deve estar R$ 6,36' as status;