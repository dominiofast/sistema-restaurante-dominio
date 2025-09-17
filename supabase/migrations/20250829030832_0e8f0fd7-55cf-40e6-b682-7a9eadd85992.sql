-- Corrigir saldo do cliente 69992254080 para empresa 550e8400-e29b-41d4-a716-446655440001
UPDATE customer_cashback 
SET 
  saldo_disponivel = (
    SELECT GREATEST(
      COALESCE(SUM(CASE WHEN tipo = 'credito' THEN valor ELSE -valor END), 0), 
      0
    )
    FROM cashback_transactions 
    WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' 
    AND customer_phone = '69992254080'
  ),
  updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' 
AND customer_phone = '69992254080';