-- Função de debug para ver o erro exato do Mercado Pago
CREATE OR REPLACE FUNCTION debug_mercado_pago_pix(
  p_company_id UUID,
  p_amount DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_config RECORD;
  v_payment_data JSON;
  v_response JSON;
  v_http_response RECORD;
BEGIN
  -- Buscar configuração
  SELECT * INTO v_config
  FROM mercado_pago_config
  WHERE company_id = p_company_id 
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Config não encontrada'
    );
  END IF;

  -- Preparar dados simples
  v_payment_data := json_build_object(
    'transaction_amount', p_amount,
    'description', 'Teste PIX',
    'payment_method_id', 'pix',
    'payer', json_build_object(
      'email', 'test@example.com',
      'first_name', 'Cliente',
      'identification', json_build_object(
        'type', 'CPF',
        'number', '11111111111'
      )
    )
  );

  -- Fazer requisição e capturar resposta completa
  SELECT * INTO v_http_response
  FROM http((
    'POST',
    'https://api.mercadopago.com/v1/payments',
    ARRAY[
      http_header('Authorization', 'Bearer ' || v_config.access_token),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    v_payment_data::TEXT
  )::http_request);

  -- Retornar resposta completa para debug
  RETURN json_build_object(
    'success', true,
    'config_found', true,
    'access_token_length', LENGTH(v_config.access_token),
    'sandbox_mode', v_config.sandbox_mode,
    'http_status', v_http_response.status,
    'http_response', v_http_response.content,
    'payment_data_sent', v_payment_data
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro: ' || SQLERRM
    );
END;
$function$;

-- Dar permissão
GRANT EXECUTE ON FUNCTION debug_mercado_pago_pix TO authenticated;
