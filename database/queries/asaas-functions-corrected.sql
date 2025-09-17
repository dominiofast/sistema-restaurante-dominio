-- Função corrigida para criar cobrança PIX via Asaas (baseada na documentação oficial)
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
  v_customer_response JSON;
  v_payment_response JSON;
  v_qr_response JSON;
  v_customer_id TEXT;
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

  -- Definir URL da API correta
  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- 1. Criar cliente no Asaas
  v_customer_data := json_build_object(
    'name', p_customer_name,
    'email', COALESCE(p_customer_email, REPLACE(p_customer_phone, ' ', '') || '@temp.com'),
    'phone', p_customer_phone,
    'cpfCnpj', COALESCE(p_customer_cpf, '11111111111')
  );

  SELECT content INTO v_customer_response
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

  -- Se cliente já existe, buscar pelo email
  IF v_customer_response->>'id' IS NULL THEN
    SELECT content INTO v_customer_response
    FROM http((
      'GET',
      v_api_url || '/customers?email=' || COALESCE(p_customer_email, REPLACE(p_customer_phone, ' ', '') || '@temp.com'),
      ARRAY[
        http_header('access_token', v_config.api_key)
      ],
      NULL,
      NULL
    )::http_request);
    
    -- Pegar primeiro cliente da lista se existir
    IF v_customer_response->'data'->0->>'id' IS NOT NULL THEN
      v_customer_id := v_customer_response->'data'->0->>'id';
    ELSE
      RETURN json_build_object(
        'success', false,
        'error', 'Erro ao criar cliente no Asaas',
        'details', v_customer_response
      );
    END IF;
  ELSE
    v_customer_id := v_customer_response->>'id';
  END IF;

  -- 2. Criar cobrança PIX
  v_payment_data := json_build_object(
    'customer', v_customer_id,
    'billingType', 'PIX',
    'value', p_amount,
    'description', p_description,
    'externalReference', COALESCE(p_external_reference, 'order-' || EXTRACT(EPOCH FROM NOW())::TEXT),
    'dueDate', CURRENT_DATE::TEXT
  );

  SELECT content INTO v_payment_response
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

  v_payment_id := v_payment_response->>'id';

  IF v_payment_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao criar cobrança no Asaas',
      'details', v_payment_response
    );
  END IF;

  -- 3. Gerar QR Code PIX
  SELECT content INTO v_qr_response
  FROM http((
    'GET',
    v_api_url || '/payments/' || v_payment_id || '/pixQrCode',
    ARRAY[
      http_header('access_token', v_config.api_key)
    ],
    NULL,
    NULL
  )::http_request);

  -- Salvar no banco
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
    customer_id,
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
    v_payment_response->>'status',
    v_qr_response->>'payload',
    v_qr_response->>'encodedImage',
    (CURRENT_DATE + INTERVAL '1 day')::timestamp with time zone,
    v_customer_id,
    p_customer_name,
    COALESCE(p_customer_email, REPLACE(p_customer_phone, ' ', '') || '@temp.com'),
    p_customer_phone,
    p_customer_cpf,
    v_payment_response
  );

  -- Retornar dados
  RETURN json_build_object(
    'success', true,
    'payment', json_build_object(
      'id', v_payment_id,
      'status', v_payment_response->>'status',
      'qr_code', v_qr_response->>'payload',
      'qr_code_base64', v_qr_response->>'encodedImage',
      'amount', p_amount,
      'expires_at', (CURRENT_DATE + INTERVAL '1 day')::TEXT,
      'customer_id', v_customer_id
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

-- Função para verificar status (corrigida)
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
  v_api_url TEXT;
BEGIN
  -- Buscar registro
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

  v_api_url := CASE 
    WHEN v_payment_record.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Consultar status
  SELECT content INTO v_response
  FROM http((
    'GET',
    v_api_url || '/payments/' || p_payment_id,
    ARRAY[
      http_header('access_token', v_payment_record.api_key)
    ],
    NULL,
    NULL
  )::http_request);

  IF v_response->>'id' IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao consultar status no Asaas',
      'details', v_response
    );
  END IF;

  v_current_status := v_response->>'status';

  -- Atualizar no banco se mudou
  IF v_current_status != v_payment_record.status THEN
    UPDATE asaas_payments
    SET 
      status = v_current_status,
      confirmed_at = CASE WHEN v_current_status = 'CONFIRMED' THEN NOW() ELSE confirmed_at END,
      updated_at = NOW(),
      asaas_response = v_response
    WHERE payment_id = p_payment_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'payment', json_build_object(
      'id', p_payment_id,
      'status', v_current_status,
      'value', (v_response->>'value')::DECIMAL,
      'confirmedDate', v_response->>'confirmedDate'
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
