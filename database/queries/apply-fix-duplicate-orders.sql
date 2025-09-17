-- Script para aplicar correção de pedidos duplicados
-- Execute este script no SQL Editor do Supabase

-- Atualizar a função identify_orphan_payments para verificar payment_id
CREATE OR REPLACE FUNCTION identify_orphan_payments()
RETURNS TABLE(
  payment_id TEXT,
  customer_phone TEXT,
  amount DECIMAL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  days_since_payment INTEGER,
  has_matching_order BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.payment_id,
    ap.customer_phone,
    ap.amount,
    ap.confirmed_at,
    EXTRACT(DAY FROM NOW() - ap.confirmed_at)::INTEGER as days_since_payment,
    EXISTS(
      SELECT 1 FROM pedidos p 
      WHERE (
        -- Verificar por telefone e valor próximo
        (p.telefone = ap.customer_phone 
         AND p.created_at BETWEEN ap.confirmed_at - INTERVAL '5 minutes' 
                              AND ap.confirmed_at + INTERVAL '30 minutes'
         AND ABS(p.total - ap.amount) <= 5.00) -- Tolerância de R$ 5
        OR
        -- Verificar por payment_id nas observações ou pagamento
        (p.observacoes ILIKE '%' || ap.payment_id || '%'
         OR p.pagamento ILIKE '%' || ap.payment_id || '%')
      )
    ) as has_matching_order
  FROM asaas_payments ap
  WHERE ap.status IN ('CONFIRMED', 'RECEIVED')
    AND ap.confirmed_at IS NOT NULL
    AND ap.confirmed_at >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY ap.confirmed_at DESC;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION identify_orphan_payments() IS 'Identifica pagamentos órfãos verificando tanto por telefone/valor quanto por payment_id para evitar duplicações';

-- Verificar se a função foi atualizada corretamente
SELECT 'Função identify_orphan_payments atualizada com sucesso!' as status;