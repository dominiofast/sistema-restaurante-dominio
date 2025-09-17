-- Função para criar cobrança PIX via Asaas
CREATE OR REPLACE FUNCTION create_asaas_pix_payment(
  p_company_id UUID,
  p_amount DECIMAL,
  p_description TEXT,
  p_customer_name TEXT,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_cpf TEXT DEFAULT NULL,
  p_external_reference TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_config RECORD;
  v_customer_data JSON;
  v_payment_data JSON;
  v_response JSON;
  v_payment_id TEXT;
  v_api_url TEXT;
BEGIN
  -- Buscar configuração do Asaas
  SELECT * INTO v_config
  FROM asaas_config
  WHERE company_id = p_company_id 
    AND is_active = true 
    AND pix_enabled = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Configuração do Asaas não encontrada ou PIX não habilitado'
    );
  END IF;

  IF v_config.api_key IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'API Key não configurada'
    );
  END IF;

  -- Definir URL da API
  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Preparar dados do cliente
  v_customer_data := json_build_object(
    'name', p_customer_name,
    'email', COALESCE(p_customer_email, p_customer_phone || '@temp.com'),
    'phone', p_customer_phone,
    'cpfCnpj', COALESCE(p_customer_cpf, '11111111111'),
    'externalReference', p_external_reference
  );

  -- Criar/buscar cliente no Asaas primeiro
  SELECT content INTO v_response
  FROM http((
    'POST',
    v_api_url || '/customers',
    ARRAY[
      http_header('access_token', v_config.api_key),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    v_customer_data::TEXT
  )::http_request);

  -- Se cliente já existe, buscar pelo CPF
  IF v_response->>'id' IS NULL AND v_response->'errors'->0->>'code' = 'already_exists' THEN
    SELECT content INTO v_response
    FROM http((
      'GET',
      v_api_url || '/customers?cpfCnpj=' || COALESCE(p_customer_cpf, '11111111111'),
      ARRAY[
        http_header('access_token', v_config.api_key),
        http_header('Content-Type', 'application/json')
      ],
      NULL,
      NULL
    )::http_request);
    
    -- Pegar primeiro cliente da lista
    IF v_response->'data'->0->>'id' IS NOT NULL THEN
      v_response := v_response->'data'->0;
    END IF;
  END IF;

  IF v_response->>'id' IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao criar/buscar cliente no Asaas',
      'details', v_response
    );
  END IF;

  -- Preparar dados da cobrança PIX
  v_payment_data := json_build_object(
    'customer', v_response->>'id',
    'billingType', 'PIX',
    'value', p_amount,
    'description', p_description,
    'externalReference', COALESCE(p_external_reference, 'order-' || EXTRACT(EPOCH FROM NOW())::TEXT),
    'dueDate', (CURRENT_DATE + INTERVAL '1 day')::TEXT
  );

  -- Criar cobrança PIX
  SELECT content INTO v_response
  FROM http((
    'POST',
    v_api_url || '/payments',
    ARRAY[
      http_header('access_token', v_config.api_key),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    v_payment_data::TEXT
  )::http_request);

  v_payment_id := v_response->>'id';

  IF v_payment_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao criar cobrança no Asaas',
      'details', v_response
    );
  END IF;

  -- Gerar QR Code PIX
  SELECT content INTO v_response
  FROM http((
    'GET',
    v_api_url || '/payments/' || v_payment_id || '/pixQrCode',
    ARRAY[
      http_header('access_token', v_config.api_key),
      http_header('Content-Type', 'application/json')
    ],
    NULL,
    NULL
  )::http_request);

  -- Salvar no banco para rastreamento
  INSERT INTO asaas_payments (
    company_id,
    payment_id,
    external_reference,
    amount,
    payment_method,
    status,
    pix_qr_code,
    pix_qr_code_base64,
    pix_expires_at,
    customer_name,
    customer_email,
    customer_phone,
    customer_cpf,
    asaas_response
  ) VALUES (
    p_company_id,
    v_payment_id,
    p_external_reference,
    p_amount,
    'PIX',
    'PENDING',
    v_response->>'payload',
    v_response->>'encodedImage',
    (CURRENT_DATE + INTERVAL '1 day')::timestamp with time zone,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_customer_cpf,
    v_response
  );

  -- Retornar dados do pagamento
  RETURN json_build_object(
    'success', true,
    'payment', json_build_object(
      'id', v_payment_id,
      'status', 'PENDING',
      'qr_code', v_response->>'payload',
      'qr_code_base64', v_response->>'encodedImage',
      'amount', p_amount,
      'expires_at', (CURRENT_DATE + INTERVAL '1 day')::TEXT
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
CREATE OR REPLACE FUNCTION check_asaas_payment_status(
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
  v_api_url TEXT;
BEGIN
  -- Buscar registro do pagamento
  SELECT ap.*, ac.api_key, ac.sandbox_mode
  INTO v_payment_record
  FROM asaas_payments ap
  JOIN asaas_config ac ON ap.company_id = ac.company_id
  WHERE ap.payment_id = p_payment_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado'
    );
  END IF;

  -- Definir URL da API
  v_api_url := CASE 
    WHEN v_payment_record.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Consultar status na API do Asaas
  SELECT content INTO v_response
  FROM http((
    'GET',
    v_api_url || '/payments/' || p_payment_id,
    ARRAY[
      http_header('access_token', v_payment_record.api_key),
      http_header('Content-Type', 'application/json')
    ],
    NULL,
    NULL
  )::http_request);

  IF v_response->>'id' IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao consultar status no Asaas'
    );
  END IF;

  v_current_status := v_response->>'status';
  v_previous_status := v_payment_record.status;

  -- Atualizar status no banco se mudou
  IF v_current_status != v_previous_status THEN
    UPDATE asaas_payments
    SET 
      status = v_current_status,
      confirmed_at = CASE WHEN v_current_status = 'CONFIRMED' THEN NOW() ELSE confirmed_at END,
      updated_at = NOW(),
      asaas_response = v_response
    WHERE payment_id = p_payment_id;
  END IF;

  -- Retornar status atual
  RETURN json_build_object(
    'success', true,
    'payment', json_build_object(
      'id', p_payment_id,
      'status', v_current_status,
      'external_reference', v_response->>'externalReference',
      'value', (v_response->>'value')::DECIMAL,
      'confirmedDate', v_response->>'confirmedDate',
      'paymentDate', v_response->>'paymentDate'
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
GRANT EXECUTE ON FUNCTION create_asaas_pix_payment TO authenticated;
GRANT EXECUTE ON FUNCTION check_asaas_payment_status TO authenticated;
