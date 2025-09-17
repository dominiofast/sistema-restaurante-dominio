-- CORRIGIR SALDO COMPLETAMENTE 
-- Vamos zerar e recalcular baseado apenas no que deveria existir

-- Saldo correto seria:
-- Pedido #555: subtotal R$ 79,52 com cashback aplicado de R$ 5,38 = cashback novo R$ 7,41
-- Pedido #556: subtotal R$ 63,57 com cashback aplicado de R$ 13,33 = cashback novo R$ 6,36
-- Saldo final: 0 + 7,41 + 6,36 = R$ 13,77

-- REMOVER a transação duplicada de correção manual
DELETE FROM cashback_transactions 
WHERE id = '3ad309df-2e34-4ff6-b63c-0d8b936e9cef';

-- CORRIGIR o valor do cashback do pedido #555 (era R$ 7,95, deveria ser R$ 7,41)
UPDATE cashback_transactions 
SET valor = 7.41, descricao = 'Cashback do pedido #555 (corrigido)'
WHERE id = '705d868f-5ae7-4048-a6e1-eae7d7dda7dc';

-- RECALCULAR saldo total baseado nas transações
WITH saldo_calculado AS (
    SELECT 
        SUM(CASE WHEN tipo = 'credito' THEN valor ELSE -valor END) as saldo_real
    FROM cashback_transactions 
    WHERE customer_phone = '69992254080' 
    AND company_id = '550e8400-e29b-41d4-a716-446655440001'
)
UPDATE customer_cashback 
SET 
    saldo_disponivel = (SELECT saldo_real FROM saldo_calculado),
    updated_at = now()
WHERE customer_phone = '69992254080' 
AND company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar resultado
SELECT 'Saldo recalculado corretamente!' as status;