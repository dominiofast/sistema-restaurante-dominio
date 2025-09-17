-- Criar função para identificar e resolver pagamentos órfãos
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

-- Criar função para notificar sobre pagamentos órfãos
CREATE OR REPLACE FUNCTION notify_orphan_payments()
RETURNS TABLE(
  total_orphans INTEGER,
  total_amount DECIMAL,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  orphan_count INTEGER := 0;
  orphan_amount DECIMAL := 0;
  orphan_details JSONB;
BEGIN
  -- Contar pagamentos órfãos (pagos mas sem pedido)
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount), 0),
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'payment_id', payment_id,
        'phone', customer_phone,
        'amount', amount,
        'confirmed_at', confirmed_at,
        'days_since', days_since_payment
      )
    )
  INTO orphan_count, orphan_amount, orphan_details
  FROM identify_orphan_payments()
  WHERE has_matching_order = FALSE
    AND days_since_payment <= 2; -- Últimos 2 dias

  -- Log do resultado
  INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
  ) VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::UUID, -- Company ID padrão
    'SYSTEM_MONITOR',
    'PAYMENT_ORPHAN_CHECK',
    'PAGAMENTOS ÓRFÃOS DETECTADOS: ' || orphan_count || ' pagamentos totalizando R$ ' || orphan_amount::TEXT || ' - Detalhes: ' || COALESCE(orphan_details::TEXT, '[]'),
    'orphan_payment_alert',
    NOW()
  );

  RETURN QUERY
  SELECT orphan_count, orphan_amount, orphan_details;
END;
$$;

-- Criar trigger para monitorar mudanças de status em asaas_payments
CREATE OR REPLACE FUNCTION monitor_payment_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se o status mudou para CONFIRMED/RECEIVED, verificar se há pedido correspondente
  IF (NEW.status IN ('CONFIRMED', 'RECEIVED') AND OLD.status NOT IN ('CONFIRMED', 'RECEIVED')) THEN
    
    -- Log da confirmação
    INSERT INTO ai_conversation_logs (
      company_id,
      customer_phone,
      customer_name,
      message_content,
      message_type,
      created_at
    ) VALUES (
      NEW.company_id,
      NEW.customer_phone,
      NEW.customer_name,
      'PAGAMENTO CONFIRMADO: ' || NEW.payment_id || ' - Valor: R$ ' || NEW.amount || ' - Telefone: ' || NEW.customer_phone,
      'payment_confirmed',
      NOW()
    );

    -- Verificar se há pedido correspondente após 2 minutos
    PERFORM pg_notify('check_orphan_payment', 
      JSONB_BUILD_OBJECT(
        'payment_id', NEW.payment_id,
        'customer_phone', NEW.customer_phone,
        'amount', NEW.amount,
        'company_id', NEW.company_id,
        'check_after', NOW() + INTERVAL '2 minutes'
      )::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_monitor_payment_status ON asaas_payments;
CREATE TRIGGER trigger_monitor_payment_status
  AFTER UPDATE ON asaas_payments
  FOR EACH ROW
  EXECUTE FUNCTION monitor_payment_status_change();

-- Permissões
GRANT EXECUTE ON FUNCTION identify_orphan_payments() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_orphan_payments() TO authenticated;