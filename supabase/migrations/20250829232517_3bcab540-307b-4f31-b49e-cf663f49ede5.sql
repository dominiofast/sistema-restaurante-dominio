-- Corrigir saldo de cashback do cliente 69992254080
-- Saldo atual: R$ 15,38 (incorreto)
-- Saldo calculado: -R$ 76,59 (deve dinheiro)
-- Ação: Zerar saldo e registrar correção

-- 1. Atualizar saldo para zero (não permitir saldo negativo)
UPDATE customer_cashback 
SET 
    saldo_disponivel = 0.00,
    updated_at = now()
WHERE customer_phone = '69992254080' 
AND company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 2. Registrar transação de correção administrativa
INSERT INTO cashback_transactions (
    company_id,
    customer_phone,
    customer_name,
    valor,
    tipo,
    descricao,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '69992254080',
    'Cleber RC',
    15.38,
    'debito',
    'CORREÇÃO ADMINISTRATIVA: Ajuste de saldo inconsistente. Saldo anterior: R$ 15,38 | Saldo calculado: -R$ 76,59 | Diferença corrigida: R$ 91,97',
    now()
);