-- INTEGRAÇÃO DA FUNÇÃO ANTI-DUPLICAÇÃO NA EDGE FUNCTION
-- Problema: A função check_existing_order_before_create existe mas não está sendo usada
-- Solução: Criar uma versão melhorada que pode ser chamada via RPC

-- 1. CRIAR VERSÃO RPC DA FUNÇÃO ANTI-DUPLICAÇÃO
CREATE OR REPLACE FUNCTION rpc_check_existing_order(
  p_company_id UUID,
  p_payment_id TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL,
  p_amount DECIMAL DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_count INTEGER := 0;
  existing_orders JSON;
  check_result JSON;
BEGIN
  -- Verificar se já existe pedido com critérios múltiplos
  SELECT COUNT(*), JSON_AGG(JSON_BUILD_OBJECT(
    'id', p.id,
    'numero_pedido', p.numero_pedido,
    'created_at', p.created_at,
    'total', p.total,
    'telefone', p.telefone
  ))
  INTO existing_count, existing_orders
  FROM pedidos p
  WHERE p.company_id = p_company_id
  AND (
    -- Verificar por payment_id se fornecido
    (p_payment_id IS NOT NULL AND (
      p.observacoes ILIKE '%' || p_payment_id || '%'
      OR p.pagamento ILIKE '%' || p_payment_id || '%'
    ))
    OR
    -- Verificar por telefone e valor próximo nos últimos 10 minutos se fornecidos
    (p_customer_phone IS NOT NULL AND p_amount IS NOT NULL AND (
      p.telefone = p_customer_phone 
      AND p.created_at >= NOW() - INTERVAL '10 minutes'
      AND ABS(p.total - p_amount) <= 1.00
    ))
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
    p_company_id,
    COALESCE(p_customer_phone, 'N/A'),
    'RPC_ANTI_DUPLICATE_CHECK',
    'VERIFICAÇÃO RPC: payment_id=' || COALESCE(p_payment_id, 'NULL') || 
    ' telefone=' || COALESCE(p_customer_phone, 'NULL') || 
    ' valor=' || COALESCE(p_amount::TEXT, 'NULL') || 
    ' pedidos_existentes=' || existing_count,
    'rpc_anti_duplicate_check',
    NOW()
  );
  
  -- Construir resultado
  check_result := JSON_BUILD_OBJECT(
    'has_duplicates', existing_count > 0,
    'duplicate_count', existing_count,
    'existing_orders', COALESCE(existing_orders, '[]'::JSON),
    'check_timestamp', NOW()
  );
  
  RETURN check_result;
END;
$$;

-- 2. PERMISSÕES
GRANT EXECUTE ON FUNCTION rpc_check_existing_order(UUID, TEXT, TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_check_existing_order(UUID, TEXT, TEXT, DECIMAL) TO anon;

-- 3. EXEMPLO DE USO NA EDGE FUNCTION
/*
Na função criar-pedido-publico, adicionar antes de criar o pedido:

// Verificação anti-duplicação usando RPC
const { data: duplicateCheck, error: duplicateError } = await supabase
  .rpc('rpc_check_existing_order', {
    p_company_id: pedidoData.companyId,
    p_payment_id: pixPaymentId, // ou null
    p_customer_phone: pedidoData.cliente.telefone,
    p_amount: pedidoData.total
  });

if (duplicateError) {
  console.error('❌ Erro na verificação anti-duplicação:', duplicateError);
} else if (duplicateCheck?.has_duplicates) {
  console.log('⚠️ Pedido duplicado detectado:', duplicateCheck);
  const existingOrder = duplicateCheck.existing_orders[0];
  return new Response(
    JSON.stringify({
      success: true,
      pedido_id: existingOrder.id,
      numero_pedido: existingOrder.numero_pedido,
      message: 'Pedido já existe - duplicação prevenida',
      duplicate_prevented: true,
      duplicate_details: duplicateCheck
    }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
*/

-- 4. LOG DA INTEGRAÇÃO
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
  'INTEGRATION_ANTI_DUPLICATE',
  'FUNÇÃO RPC CRIADA: rpc_check_existing_order para integração com edge function',
  'system_integration_anti_duplicate',
  NOW()
);

SELECT 'FUNÇÃO RPC ANTI-DUPLICAÇÃO CRIADA: rpc_check_existing_order' as status;

-- 5. TESTE DA FUNÇÃO
SELECT 
  'TESTE DA FUNÇÃO RPC' as info,
  rpc_check_existing_order(
    '550e8400-e29b-41d4-a716-446655440001'::UUID,
    NULL,
    '11999999999',
    20.90
  ) as resultado_teste;