-- CORREÇÃO URGENTE DA FUNÇÃO RPC ANTI-DUPLICAÇÃO
-- Execute após o script de emergência

-- 1. RECRIAR A FUNÇÃO RPC COM LOGS MAIS DETALHADOS
DROP FUNCTION IF EXISTS rpc_check_existing_order(UUID, TEXT, TEXT, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS rpc_check_existing_order(UUID, TEXT, TEXT, NUMERIC) CASCADE;

CREATE OR REPLACE FUNCTION rpc_check_existing_order(
  p_company_id UUID,
  p_payment_id TEXT,
  p_customer_phone TEXT,
  p_amount DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_order RECORD;
  v_result JSON;
  v_log_message TEXT;
  v_count INTEGER := 0;
BEGIN
  -- Log detalhado da verificação
  v_log_message := format('🔍 RPC Anti-duplicate: company=%s, payment=%s, phone=%s, amount=%s', 
                         p_company_id, COALESCE(p_payment_id, 'NULL'), p_customer_phone, p_amount);
  
  RAISE LOG '%', v_log_message;
  
  -- Buscar pedido existente com múltiplos critérios
  SELECT p.id, p.created_at, p.total, p.telefone, p.observacoes, p.pagamento, p.numero_pedido
  INTO v_existing_order
  FROM pedidos p
  WHERE p.company_id = p_company_id
    AND (
      -- Critério 1: Payment ID nas observações ou pagamento (se fornecido)
      (p_payment_id IS NOT NULL AND (
        p.observacoes ILIKE '%' || p_payment_id || '%' OR 
        p.pagamento ILIKE '%' || p_payment_id || '%'
      ))
      OR
      -- Critério 2: Mesmo telefone, valor próximo e tempo próximo (últimas 2 horas)
      (p.telefone = p_customer_phone 
       AND ABS(p.total - p_amount) <= 2.00 
       AND p.created_at >= NOW() - INTERVAL '2 hours')
    )
  ORDER BY p.created_at DESC
  LIMIT 1;
  
  -- Contar quantos pedidos similares existem
  SELECT COUNT(*)
  INTO v_count
  FROM pedidos p
  WHERE p.company_id = p_company_id
    AND p.telefone = p_customer_phone 
    AND ABS(p.total - p_amount) <= 2.00 
    AND p.created_at >= NOW() - INTERVAL '2 hours';
  
  -- Log adicional no banco
  INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
  ) VALUES (
    p_company_id,
    p_customer_phone,
    'RPC_CHECK',
    format('RPC Check: payment=%s, phone=%s, amount=%s, found_order=%s, similar_count=%s', 
           COALESCE(p_payment_id, 'NULL'), p_customer_phone, p_amount, 
           COALESCE(v_existing_order.id::TEXT, 'NONE'), v_count),
    'rpc_anti_duplicate_detailed',
    NOW()
  );
  
  -- Construir resultado
  IF v_existing_order.id IS NOT NULL THEN
    v_result := json_build_object(
      'has_duplicates', true,
      'existing_order', json_build_object(
        'id', v_existing_order.id,
        'numero_pedido', v_existing_order.numero_pedido,
        'created_at', v_existing_order.created_at,
        'total', v_existing_order.total,
        'telefone', v_existing_order.telefone,
        'observacoes', v_existing_order.observacoes,
        'pagamento', v_existing_order.pagamento
      ),
      'similar_count', v_count,
      'message', 'Pedido duplicado encontrado - criação bloqueada'
    );
    
    RAISE LOG '🚫 DUPLICATE BLOCKED: Order ID % for payment %', v_existing_order.id, COALESCE(p_payment_id, 'N/A');
  ELSE
    v_result := json_build_object(
      'has_duplicates', false,
      'similar_count', v_count,
      'message', 'Nenhum pedido duplicado encontrado - pode prosseguir'
    );
    
    RAISE LOG '✅ NO DUPLICATE: Safe to create order for payment %', COALESCE(p_payment_id, 'N/A');
  END IF;
  
  RETURN v_result;
END;
$$;

-- 2. CONFIGURAR PERMISSÕES
GRANT EXECUTE ON FUNCTION rpc_check_existing_order(UUID, TEXT, TEXT, DECIMAL) TO anon;
GRANT EXECUTE ON FUNCTION rpc_check_existing_order(UUID, TEXT, TEXT, DECIMAL) TO authenticated;

-- 3. TESTAR A FUNÇÃO
SELECT 'TESTANDO FUNÇÃO RPC:' as info;
SELECT rpc_check_existing_order(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'test-payment-123',
  '11999999999',
  22.90
) as test_result;

SELECT 'FUNÇÃO RPC CORRIGIDA E TESTADA!' as status;