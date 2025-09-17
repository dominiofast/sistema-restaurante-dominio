-- Migração para adicionar função RPC anti-duplicação robusta
-- Esta função substitui a verificação básica PIX por uma verificação completa

-- Remover função existente se houver
DROP FUNCTION IF EXISTS rpc_check_existing_order(UUID, TEXT, TEXT, DECIMAL);
DROP FUNCTION IF EXISTS rpc_check_existing_order(UUID, TEXT, TEXT, NUMERIC);

-- Criar função RPC para verificação anti-duplicação
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
BEGIN
  -- Log da verificação
  v_log_message := format('Anti-duplicate check: company=%s, payment=%s, phone=%s, amount=%s', 
                         p_company_id, p_payment_id, p_customer_phone, p_amount);
  
  RAISE LOG '%', v_log_message;
  
  -- Buscar pedido existente com múltiplos critérios
  SELECT p.id, p.created_at, p.total, p.telefone, p.observacoes, p.pagamento
  INTO v_existing_order
  FROM pedidos p
  WHERE p.company_id = p_company_id
    AND (
      -- Critério 1: Payment ID nas observações ou pagamento
      (p.observacoes ILIKE '%' || p_payment_id || '%' OR 
       p.pagamento ILIKE '%' || p_payment_id || '%')
      OR
      -- Critério 2: Mesmo telefone, valor próximo e tempo próximo (últimas 2 horas)
      (p.telefone = p_customer_phone 
       AND ABS(p.total - p_amount) <= 2.00 
       AND p.created_at >= NOW() - INTERVAL '2 hours')
    )
  ORDER BY p.created_at DESC
  LIMIT 1;
  
  -- Construir resultado
  IF v_existing_order.id IS NOT NULL THEN
    v_result := json_build_object(
      'has_duplicates', true,
      'existing_order', json_build_object(
        'id', v_existing_order.id,
        'created_at', v_existing_order.created_at,
        'total', v_existing_order.total,
        'telefone', v_existing_order.telefone,
        'observacoes', v_existing_order.observacoes,
        'pagamento', v_existing_order.pagamento
      ),
      'message', 'Pedido duplicado encontrado - não será criado novo pedido'
    );
    
    RAISE LOG 'DUPLICATE FOUND: Order ID % for payment %', v_existing_order.id, p_payment_id;
  ELSE
    v_result := json_build_object(
      'has_duplicates', false,
      'message', 'Nenhum pedido duplicado encontrado - pode prosseguir'
    );
    
    RAISE LOG 'NO DUPLICATE: Safe to create order for payment %', p_payment_id;
  END IF;
  
  RETURN v_result;
END;
$$;

-- Configurar permissões RPC
GRANT EXECUTE ON FUNCTION rpc_check_existing_order(UUID, TEXT, TEXT, DECIMAL) TO anon;
GRANT EXECUTE ON FUNCTION rpc_check_existing_order(UUID, TEXT, TEXT, DECIMAL) TO authenticated;

-- Comentário explicativo
COMMENT ON FUNCTION rpc_check_existing_order(UUID, TEXT, TEXT, DECIMAL) IS 'Função RPC para verificação robusta de pedidos duplicados baseada em payment_id, telefone, valor e tempo';

-- Log da migração
DO $$
BEGIN
  RAISE LOG 'Migration completed: rpc_check_existing_order function created with RPC permissions';
END
$$;