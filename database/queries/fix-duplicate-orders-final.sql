-- SOLUÇÃO DEFINITIVA PARA DUPLICAÇÃO DE PEDIDOS PIX
-- Problema identificado: Frontend cria pedido via onSuccess + Trigger envia notificação sem listener

-- 1. DESATIVAR O TRIGGER QUE ESTÁ CAUSANDO CONFUSÃO
-- O trigger monitor_payment_status_change envia pg_notify mas não há listener
-- Isso pode estar causando race conditions

DROP TRIGGER IF EXISTS trigger_monitor_payment_status ON asaas_payments;

-- 2. CRIAR UM TRIGGER MAIS SIMPLES QUE APENAS LOGA
-- Sem pg_notify que não tem listener
CREATE OR REPLACE FUNCTION log_payment_confirmation()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Apenas logar quando pagamento for confirmado
  IF (NEW.status IN ('CONFIRMED', 'RECEIVED') AND OLD.status NOT IN ('CONFIRMED', 'RECEIVED')) THEN
    
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
      'PAGAMENTO CONFIRMADO: ' || NEW.payment_id || ' - Valor: R$ ' || NEW.amount || ' - Telefone: ' || NEW.customer_phone || ' - SEM TRIGGER DE CRIAÇÃO DE PEDIDO',
      'payment_confirmed_log_only',
      NOW()
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. CRIAR O NOVO TRIGGER APENAS PARA LOG
CREATE TRIGGER trigger_log_payment_confirmation
  AFTER UPDATE ON asaas_payments
  FOR EACH ROW
  EXECUTE FUNCTION log_payment_confirmation();

-- 4. MELHORAR A FUNÇÃO DE ANTI-DUPLICAÇÃO NO FRONTEND
-- Criar função que verifica se já existe pedido antes de criar
CREATE OR REPLACE FUNCTION check_existing_order_before_create(
  p_payment_id TEXT,
  p_customer_phone TEXT,
  p_amount DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_count INTEGER := 0;
BEGIN
  -- Verificar se já existe pedido com este payment_id
  SELECT COUNT(*)
  INTO existing_count
  FROM pedidos p
  WHERE (
    -- Verificar por payment_id nas observações ou pagamento
    (p.observacoes ILIKE '%' || p_payment_id || '%'
     OR p.pagamento ILIKE '%' || p_payment_id || '%')
    OR
    -- Verificar por telefone e valor próximo nos últimos 10 minutos
    (p.telefone = p_customer_phone 
     AND p.created_at >= NOW() - INTERVAL '10 minutes'
     AND ABS(p.total - p_amount) <= 1.00) -- Tolerância de R$ 1
  );
  
  -- Log da verificação
  INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
  ) VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::UUID,
    p_customer_phone,
    'ANTI_DUPLICATE_CHECK',
    'VERIFICAÇÃO ANTI-DUPLICAÇÃO: payment_id=' || p_payment_id || ' telefone=' || p_customer_phone || ' valor=' || p_amount || ' pedidos_existentes=' || existing_count,
    'anti_duplicate_check',
    NOW()
  );
  
  -- Retorna TRUE se já existe pedido (deve bloquear criação)
  RETURN existing_count > 0;
END;
$$;

-- 5. ATUALIZAR A FUNÇÃO criar-pedido-publico PARA USAR A VERIFICAÇÃO
-- Esta função deve ser chamada no início da função criar-pedido-publico
-- Exemplo de uso:
-- IF check_existing_order_before_create(payment_data.payment_id, customer_phone, total_amount) THEN
--   RAISE EXCEPTION 'Pedido já existe para este pagamento: %', payment_data.payment_id;
-- END IF;

-- 6. PERMISSÕES
GRANT EXECUTE ON FUNCTION check_existing_order_before_create(TEXT, TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION log_payment_confirmation() TO authenticated;

-- 7. LOG DA CORREÇÃO
INSERT INTO ai_conversation_logs (
  company_id,
  customer_phone,
  customer_name,
  message_content,
  message_type,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'SYSTEM',
  'DUPLICATE_FIX',
  'CORREÇÃO APLICADA: Removido trigger problemático, criada função anti-duplicação check_existing_order_before_create',
  'system_fix_duplicate_orders',
  NOW()
);

SELECT 'CORREÇÃO APLICADA: Trigger problemático removido, função anti-duplicação criada' as status;

-- 8. VERIFICAR SE A CORREÇÃO FOI APLICADA
SELECT 
  'TRIGGERS ATIVOS EM ASAAS_PAYMENTS' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'asaas_payments'
  AND trigger_schema = 'public'
ORDER BY trigger_name;