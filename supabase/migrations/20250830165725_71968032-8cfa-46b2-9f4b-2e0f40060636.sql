-- CORRIGIR CASHBACK: ZERAR E CREDITAR APENAS R$ 10,18
-- O processo correto é zerar o saldo anterior e creditar apenas o cashback atual

-- 1. LIMPAR TODAS as transações de cashback do cliente hoje
DELETE FROM cashback_transactions 
WHERE customer_phone = '69992254080' 
AND company_id = '550e8400-e29b-41d4-a716-446655440001'
AND DATE(created_at) = CURRENT_DATE;

-- 2. CRIAR APENAS a transação de crédito de R$ 10,18 do pedido atual
INSERT INTO cashback_transactions (
    company_id, 
    customer_phone, 
    customer_name, 
    tipo, 
    valor, 
    descricao, 
    pedido_id, 
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', 
    '69992254080', 
    'Cleber Ruiz Camargo', 
    'credito', 
    10.18, 
    'Cashback do pedido #557', 
    557, 
    now()
);

-- 3. DEFINIR saldo final como R$ 10,18
UPDATE customer_cashback 
SET 
    saldo_disponivel = 10.18,
    saldo_total_acumulado = 10.18,
    updated_at = now()
WHERE customer_phone = '69992254080' 
AND company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 4. VERIFICAR resultado
SELECT 
    saldo_disponivel,
    saldo_total_acumulado,
    'Saldo corrigido para R$ 10,18!' as status
FROM customer_cashback 
WHERE customer_phone = '69992254080' 
AND company_id = '550e8400-e29b-41d4-a716-446655440001';