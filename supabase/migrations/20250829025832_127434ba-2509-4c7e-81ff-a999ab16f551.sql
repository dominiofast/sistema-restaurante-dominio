-- Recalcular saldos de cashback baseado nas transações
WITH saldos_calculados AS (
  SELECT 
    company_id,
    customer_phone,
    customer_name,
    COALESCE(SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END), 0) as total_creditos,
    COALESCE(SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END), 0) as total_debitos,
    COALESCE(SUM(CASE WHEN tipo = 'credito' THEN valor ELSE -valor END), 0) as saldo_correto
  FROM cashback_transactions
  GROUP BY company_id, customer_phone, customer_name
)
UPDATE customer_cashback 
SET 
  saldo_disponivel = GREATEST(saldos_calculados.saldo_correto, 0),
  saldo_total_acumulado = saldos_calculados.total_creditos,
  updated_at = now()
FROM saldos_calculados
WHERE customer_cashback.company_id = saldos_calculados.company_id 
  AND customer_cashback.customer_phone = saldos_calculados.customer_phone;