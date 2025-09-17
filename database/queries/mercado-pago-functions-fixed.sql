-- Habilitar extensão HTTP primeiro
CREATE EXTENSION IF NOT EXISTS http;

-- Função para criar pagamento PIX
CREATE OR REPLACE FUNCTION create_mercado_pago_pix(
  p_company_id UUID,
  p_amount DECIMAL,
  p_description TEXT,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL,
  p_external_reference TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_config RECORD;
  v_payment_data JSON;
  v_response JSON;
  v_payment_id TEXT;
  v_qr_code TEXT;
  v_qr_code_base64 TEXT;
  v_expiration_date TIMESTAMP;
BEGIN
  -- Buscar configuração do Mercado Pago
  SELECT * INTO v_config
  FROM mercado_pago_config
  WHERE company_id = p_company_id 
    AND is_active = true 
    AND pix_enabled = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Configuração do Mercado Pago não encontrada ou PIX não habilitado'
    );
  END IF;

  IF v_config.access_token IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Access Token não configurado'
    );
  END IF;

  -- Calcular data de expiração
  v_expiration_date := NOW() + INTERVAL '1 minute' * COALESCE(v_config.pix_expiration_minutes, 30);

  -- Preparar dados do pagamento
  v_payment_data := json_build_object(
    'transaction_amount', p_amount,
    'description', p_description,
    'payment_method_id', 'pix',
    'external_reference', COALESCE(p_external_reference, 'order-' || EXTRACT(EPOCH FROM NOW())::TEXT),
    'date_of_expiration', v_expiration_date::TEXT,
    'payer', json_build_object(
      'email', COALESCE(p_customer_phone || '@temp.com', 'customer@example.com'),
      'first_name', COALESCE(p_customer_name, 'Cliente'),
      'identification', json_build_object(
        'type', 'CPF',
        'number', '11111111111'
      )
    )
  );

  -- Fazer requisição para API do Mercado Pago
  SELECT content INTO v_response
  FROM http((
    'POST',
    CASE WHEN v_config.sandbox_mode THEN 
      'https://api.mercadopago.com/v1/payments'
    ELSE 
      'https://api.mercadopago.com/v1/payments'
    END,
    ARRAY[
      http_header('Authorization', 'Bearer ' || v_config.access_token),
      http_header('Content-Type', 'application/json'),
      http_header('X-Idempotency-Key', p_company_id::TEXT || '-' || EXTRACT(EPOCH FROM NOW())::TEXT)
    ],
    'application/json',
    v_payment_data::TEXT
  )::http_request);

  -- Extrair dados importantes
  v_payment_id := v_response->>'id';
  v_qr_code := v_response->'point_of_interaction'->'transaction_data'->>'qr_code';
  v_qr_code_base64 := v_response->'point_of_interaction'->'transaction_data'->>'qr_code_base64';

  -- Verificar se a resposta foi bem-sucedida
  IF v_payment_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao criar pagamento no Mercado Pago',
      'details', v_response
    );
  END IF;

  -- Salvar no banco para rastreamento
  INSERT INTO mercado_pago_payments (
    company_id,
    payment_id,
    external_reference,
    amount,
    status,
    qr_code,
    qr_code_base64,
    expires_at,
    customer_name,
    customer_phone
  ) VALUES (
    p_company_id,
    v_payment_id,
    p_external_reference,
    p_amount,
    v_response->>'status',
    v_qr_code,
    v_qr_code_base64,
    v_expiration_date,
    p_customer_name,
    p_customer_phone
  );

  -- Retornar dados do pagamento
  RETURN json_build_object(
    'success', true,
    'payment', json_build_object(
      'id', v_payment_id,
      'status', v_response->>'status',
      'qr_code', v_qr_code,
      'qr_code_base64', v_qr_code_base64,
      'date_of_expiration', v_response->>'date_of_expiration',
      'transaction_amount', (v_response->>'transaction_amount')::DECIMAL
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro interno: ' || SQLERRM
    );
END;
$function$;

-- Função para verificar status do pagamento
CREATE OR REPLACE FUNCTION check_mercado_pago_payment(
  p_payment_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_payment_record RECORD;
  v_response JSON;
  v_current_status TEXT;
  v_previous_status TEXT;
BEGIN
  -- Buscar registro do pagamento
  SELECT mp.*, mpc.access_token, mpc.sandbox_mode
  INTO v_payment_record
  FROM mercado_pago_payments mp
  JOIN mercado_pago_config mpc ON mp.company_id = mpc.company_id
  WHERE mp.payment_id = p_payment_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado'
    );
  END IF;

  -- Consultar status na API do Mercado Pago
  SELECT content INTO v_response
  FROM http((
    'GET',
    'https://api.mercadopago.com/v1/payments/' || p_payment_id,
    ARRAY[
      http_header('Authorization', 'Bearer ' || v_payment_record.access_token),
      http_header('Content-Type', 'application/json')
    ],
    NULL,
    NULL
  )::http_request);

  IF v_response->>'id' IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao consultar status no Mercado Pago'
    );
  END IF;

  v_current_status := v_response->>'status';
  v_previous_status := v_payment_record.status;

  -- Atualizar status no banco se mudou
  IF v_current_status != v_previous_status THEN
    UPDATE mercado_pago_payments
    SET 
      status = v_current_status,
      approved_at = CASE WHEN v_current_status = 'approved' THEN NOW() ELSE approved_at END,
      updated_at = NOW()
    WHERE payment_id = p_payment_id;
  END IF;

  -- Retornar status atual
  RETURN json_build_object(
    'success', true,
    'payment', json_build_object(
      'id', p_payment_id,
      'status', v_current_status,
      'status_detail', v_response->>'status_detail',
      'external_reference', v_response->>'external_reference',
      'transaction_amount', (v_response->>'transaction_amount')::DECIMAL,
      'date_approved', v_response->>'date_approved',
      'date_created', v_response->>'date_created',
      'date_of_expiration', v_response->>'date_of_expiration'
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro interno: ' || SQLERRM
    );
END;
$function$;

-- Dar permissões
GRANT EXECUTE ON FUNCTION create_mercado_pago_pix TO authenticated;
GRANT EXECUTE ON FUNCTION check_mercado_pago_payment TO authenticated;
