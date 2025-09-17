-- PRIMEIRA FASE: CORRIGIR DADOS INVÁLIDOS EXISTENTES
-- Remover transações com valor 0 ou negativo (dados corrompidos)
DELETE FROM cashback_transactions 
WHERE valor <= 0;

-- Verificar se há saldos negativos e corrigi-los
UPDATE customer_cashback 
SET saldo_disponivel = 0
WHERE saldo_disponivel < 0;