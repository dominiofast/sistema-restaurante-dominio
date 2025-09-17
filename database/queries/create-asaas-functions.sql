-- ========================================
-- FUNÇÕES ASAAS PARA PAGAMENTO PIX
-- ========================================
-- Execute este SQL no Supabase Dashboard

-- Habilitar extensão HTTP se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS http;

-- Remover versões antigas das funções (se existirem)
DROP FUNCTION IF EXISTS create_asaas_payment_oficial(UUID, DECIMAL, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_asaas_payment_oficial(UUID, DECIMAL, TEXT, TEXT);
DROP FUNCTION IF EXISTS debug_asaas_payment(UUID, DECIMAL, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS debug_asaas_payment(UUID, DECIMAL, TEXT, TEXT);
DROP FUNCTION IF EXISTS check_asaas_payment_status(TEXT);

-- Função melhorada para criar pagamento PIX via Asaas
CREATE OR REPLACE FUNCTION create_asaas_payment_oficial(
  p_company_id UUID,
  p_amount DECIMAL,
  p_description TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_cpf TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_response JSON;
  v_qr_response JSON;
  v_payment_id TEXT;
  v_api_url TEXT;
  v_customer_email TEXT;
  v_customer_cpf TEXT;
  v_due_date DATE;
BEGIN
  -- Buscar configuração do Asaas
  SELECT * INTO v_config FROM asaas_config WHERE company_id = p_company_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Configuração Asaas não encontrada ou inativa');
  END IF;

  IF v_config.api_key IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'API Key não configurada');
  END IF;

  -- Definir URL da API
  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Preparar dados do cliente
  v_customer_email := COALESCE(
    REPLACE(REPLACE(p_customer_phone, ' ', ''), '+55', '') || '@temp.com', 
    'cliente@temp.com'
  );
  
  -- CPF do cliente ou padrão para teste (necessário para PIX)
  v_customer_cpf := COALESCE(p_customer_cpf, '11111111111');
  
  -- Data de vencimento (hoje + margem de segurança)
  v_due_date := CURRENT_DATE + INTERVAL '1 day';

  -- Fazer requisição para criar cobrança
  SELECT content INTO v_response
  FROM http((
    'POST',
    v_api_url || '/payments',
    ARRAY[
      http_header('access_token', v_config.api_key),
      http_header('Content-Type', 'application/json'),
      http_header('User-Agent', 'Sistema-PIX/1.0')
    ],
    'application/json',
    json_build_object(
      'billingType', 'PIX',
      'value', p_amount,
      'description', COALESCE(p_description, 'Pagamento PIX'),
      'dueDate', v_due_date::TEXT,
      'customer', json_build_object(
        'name', COALESCE(p_customer_name, 'Cliente'),
        'email', v_customer_email,
        'mobilePhone', COALESCE(p_customer_phone, '11999999999'),
        'cpfCnpj', v_customer_cpf
      ),
      'postalService', false,
      'notificationDisabled', true
    )::TEXT
  )::http_request);

  -- Verificar se houve erro na API
  IF v_response->>'object' = 'error' OR v_response->>'id' IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao criar cobrança',
      'details', v_response
    );
  END IF;

  -- SEGUNDA CHAMADA: Buscar QR Code conforme documentação
  v_payment_id := v_response->>'id';
  
  SELECT content INTO v_qr_response
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

  -- Sucesso - retornar dados do pagamento com QR Code
  RETURN json_build_object(
    'success', true,
    'payment', json_build_object(
      'id', v_response->>'id',
      'status', v_response->>'status',
      'value', (v_response->>'value')::DECIMAL,
      'amount', (v_response->>'value')::DECIMAL,
      'dueDate', v_response->>'dueDate',
      'expires_at', v_qr_response->>'expirationDate',
      'invoiceUrl', v_response->>'invoiceUrl',
      'qr_code', v_qr_response->>'payload',
      'qr_code_base64', v_qr_response->>'encodedImage'
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Erro interno: ' || SQLERRM);
END;
$$;

-- Função para verificar status de pagamento Asaas
CREATE OR REPLACE FUNCTION check_asaas_payment_status(
  p_payment_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_response JSON;
  v_api_url TEXT;
BEGIN
  -- Buscar configuração ativa do Asaas (assumindo que temos apenas uma por empresa)
  SELECT ac.* INTO v_config 
  FROM asaas_config ac
  WHERE ac.is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Configuração Asaas não encontrada'
    );
  END IF;

  -- URL da API
  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Consultar status do pagamento
  SELECT content INTO v_response
  FROM http((
    'GET',
    v_api_url || '/payments/' || p_payment_id,
    ARRAY[
      http_header('access_token', v_config.api_key),
      http_header('Content-Type', 'application/json')
    ],
    NULL,
    NULL
  )::http_request);

  -- Verificar se encontrou o pagamento
  IF v_response->>'id' IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado na API Asaas'
    );
  END IF;

  -- Retornar dados do pagamento
  RETURN json_build_object(
    'success', true,
    'payment', json_build_object(
      'id', v_response->>'id',
      'status', v_response->>'status',
      'value', (v_response->>'value')::DECIMAL,
      'paymentDate', v_response->>'paymentDate',
      'confirmedDate', v_response->>'confirmedDate',
      'dueDate', v_response->>'dueDate'
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Erro interno: ' || SQLERRM
    );
END;
$$;

-- ========================================
-- FUNÇÃO DEBUG PARA INVESTIGAR PROBLEMAS
-- ========================================

CREATE OR REPLACE FUNCTION debug_asaas_payment(
  p_company_id UUID,
  p_amount DECIMAL,
  p_description TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_cpf TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_response JSON;
  v_api_url TEXT;
  v_customer_email TEXT;
  v_customer_cpf TEXT;
  v_due_date DATE;
  v_payload JSON;
  v_http_status INTEGER;
BEGIN
  -- Buscar configuração do Asaas
  SELECT * INTO v_config FROM asaas_config WHERE company_id = p_company_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'debug_step', '1_config_check',
      'success', false, 
      'error', 'Configuração Asaas não encontrada ou inativa',
      'company_id', p_company_id
    );
  END IF;

  IF v_config.api_key IS NULL THEN
    RETURN json_build_object(
      'debug_step', '2_api_key_check',
      'success', false,
      'error', 'API Key não configurada',
      'config_found', true,
      'sandbox_mode', v_config.sandbox_mode
    );
  END IF;

  -- Definir URL da API
  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Preparar dados do cliente
  v_customer_email := COALESCE(
    REPLACE(REPLACE(p_customer_phone, ' ', ''), '+55', '') || '@temp.com', 
    'cliente@temp.com'
  );
  
  v_customer_cpf := COALESCE(p_customer_cpf, '11111111111');
  v_due_date := CURRENT_DATE + INTERVAL '1 day';

  -- Preparar payload
  v_payload := json_build_object(
    'billingType', 'PIX',
    'value', p_amount,
    'description', COALESCE(p_description, 'Pagamento PIX'),
    'dueDate', v_due_date::TEXT,
    'customer', json_build_object(
      'name', COALESCE(p_customer_name, 'Cliente'),
      'email', v_customer_email,
      'mobilePhone', COALESCE(p_customer_phone, '11999999999'),
      'cpfCnpj', v_customer_cpf
    ),
    'postalService', false,
    'notificationDisabled', true
  );

  -- Fazer requisição com captura de status HTTP
  WITH http_result AS (
    SELECT 
      (response).status as status_code,
      (response).content as content
    FROM http((
      'POST',
      v_api_url || '/payments',
      ARRAY[
        http_header('access_token', v_config.api_key),
        http_header('Content-Type', 'application/json'),
        http_header('User-Agent', 'Sistema-PIX-Debug/1.0')
      ],
      'application/json',
      v_payload::TEXT
    )::http_request) as response
  )
  SELECT status_code, content INTO v_http_status, v_response FROM http_result;

  -- Retornar debug completo
  RETURN json_build_object(
    'debug_step', '3_api_call_complete',
    'success', CASE WHEN v_response->>'id' IS NOT NULL THEN true ELSE false END,
    'http_status', v_http_status,
    'api_url', v_api_url || '/payments',
    'sandbox_mode', v_config.sandbox_mode,
    'payload_sent', v_payload,
    'api_response', v_response,
    'api_key_prefix', LEFT(v_config.api_key, 20) || '...',
          'customer_data', json_build_object(
      'name', COALESCE(p_customer_name, 'Cliente'),
      'email', v_customer_email,
      'mobilePhone', COALESCE(p_customer_phone, '11999999999'),
      'cpfCnpj', v_customer_cpf
    ),
    'payment_data', json_build_object(
      'billingType', 'PIX',
      'value', p_amount,
      'dueDate', v_due_date::TEXT
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'debug_step', '4_exception',
      'success', false, 
      'error', 'Erro interno: ' || SQLERRM,
      'sqlstate', SQLSTATE
    );
END;
$$;

-- ========================================
-- FUNÇÃO PARA VERIFICAR CHAVES PIX
-- ========================================

-- Função para verificar se há chaves PIX cadastradas (requisito da documentação)
CREATE OR REPLACE FUNCTION check_asaas_pix_keys(
  p_company_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_response JSON;
  v_api_url TEXT;
BEGIN
  -- Buscar configuração do Asaas
  SELECT * INTO v_config FROM asaas_config WHERE company_id = p_company_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Configuração Asaas não encontrada');
  END IF;

  -- URL da API
  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Consultar chaves PIX
  SELECT content INTO v_response
  FROM http((
    'GET',
    v_api_url || '/pix/addressKeys',
    ARRAY[
      http_header('access_token', v_config.api_key),
      http_header('Content-Type', 'application/json')
    ],
    NULL,
    NULL
  )::http_request);

  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'hasPixKeys', COALESCE(json_array_length(v_response->'data'), 0) > 0,
    'pixKeysCount', COALESCE(json_array_length(v_response->'data'), 0),
    'pixKeys', v_response->'data'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Erro interno: ' || SQLERRM);
END;
$$;

-- ========================================
-- FUNÇÃO PARA CRIAR CHAVE PIX
-- ========================================

-- Função para criar chave PIX (EVP - aleatória) conforme documentação
CREATE OR REPLACE FUNCTION create_asaas_pix_key(
  p_company_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_response JSON;
  v_api_url TEXT;
BEGIN
  -- Buscar configuração do Asaas
  SELECT * INTO v_config FROM asaas_config WHERE company_id = p_company_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Configuração Asaas não encontrada');
  END IF;

  -- URL da API
  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Criar chave PIX aleatória (EVP)
  SELECT content INTO v_response
  FROM http((
    'POST',
    v_api_url || '/pix/addressKeys',
    ARRAY[
      http_header('access_token', v_config.api_key),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    json_build_object('type', 'EVP')::TEXT
  )::http_request);

  -- Verificar se foi criada com sucesso
  IF v_response->>'id' IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao criar chave PIX',
      'details', v_response
    );
  END IF;

  -- Retornar chave criada
  RETURN json_build_object(
    'success', true,
    'pixKey', json_build_object(
      'id', v_response->>'id',
      'key', v_response->>'addressKey',
      'type', v_response->>'type',
      'status', v_response->>'status'
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Erro interno: ' || SQLERRM);
END;
$$;

-- ========================================
-- FUNÇÃO DEBUG ESPECÍFICA PARA QR CODE
-- ========================================

-- Função para debugar especificamente o QR Code do PIX
CREATE OR REPLACE FUNCTION debug_asaas_qr_code(
  p_company_id UUID,
  p_payment_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_response JSON;
  v_api_url TEXT;
BEGIN
  -- Buscar configuração do Asaas
  SELECT * INTO v_config FROM asaas_config WHERE company_id = p_company_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Configuração Asaas não encontrada');
  END IF;

  -- URL da API
  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Buscar QR Code específico
  SELECT content INTO v_response
  FROM http((
    'GET',
    v_api_url || '/payments/' || p_payment_id || '/pixQrCode',
    ARRAY[
      http_header('access_token', v_config.api_key),
      http_header('Content-Type', 'application/json')
    ],
    NULL,
    NULL
  )::http_request);

  -- Retornar debug completo do QR Code
  RETURN json_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'api_url', v_api_url || '/payments/' || p_payment_id || '/pixQrCode',
    'sandbox_mode', v_config.sandbox_mode,
    'qr_response', v_response,
    'qr_details', json_build_object(
      'has_payload', v_response->>'payload' IS NOT NULL,
      'payload_length', COALESCE(LENGTH(v_response->>'payload'), 0),
      'payload_start', LEFT(COALESCE(v_response->>'payload', ''), 50),
      'has_encoded_image', v_response->>'encodedImage' IS NOT NULL,
      'encoded_image_length', COALESCE(LENGTH(v_response->>'encodedImage'), 0),
      'encoded_image_start', LEFT(COALESCE(v_response->>'encodedImage', ''), 50),
      'expiration_date', v_response->>'expirationDate'
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Erro interno: ' || SQLERRM);
END;
$$;

-- ========================================
-- ANÁLISE COMPARATIVA DE CHAVES PIX  
-- ========================================

-- Função para analisar estrutura detalhada da chave PIX
CREATE OR REPLACE FUNCTION analyze_pix_key(p_pix_key TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_analysis JSON;
BEGIN
  -- Análise detalhada da estrutura
  SELECT json_build_object(
    'total_length', LENGTH(p_pix_key),
    'starts_with_correct_version', p_pix_key LIKE '00020101%',
    'contains_bcb_pix', POSITION('br.gov.bcb.pix' IN p_pix_key) > 0,
    'contains_asaas', POSITION('asaas.com' IN p_pix_key) > 0,
    'has_checksum', RIGHT(p_pix_key, 4) ~ '^[0-9A-F]{4}$',
    'structure_breakdown', json_build_object(
      'version', LEFT(p_pix_key, 8),
      'bcb_position', POSITION('br.gov.bcb.pix' IN p_pix_key),
      'asaas_position', POSITION('asaas.com' IN p_pix_key),
      'checksum', RIGHT(p_pix_key, 4),
      'merchant_info', CASE 
        WHEN POSITION('5925' IN p_pix_key) > 0 THEN 
          SUBSTRING(p_pix_key FROM POSITION('5925' IN p_pix_key) + 4 FOR 25)
        ELSE 'NOT_FOUND'
      END,
      'city_info', CASE 
        WHEN POSITION('6006' IN p_pix_key) > 0 THEN 
          SUBSTRING(p_pix_key FROM POSITION('6006' IN p_pix_key) + 4 FOR 6)
        ELSE 'NOT_FOUND'
      END
    )
  ) INTO v_analysis;
  
  RETURN v_analysis;
END;
$$;

-- ========================================
-- DEBUG DETALHADO DAS CHAVES PIX
-- ========================================

CREATE OR REPLACE FUNCTION debug_pix_keys_detailed(
  p_company_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_response JSON;
  v_api_url TEXT;
  v_http_status INTEGER;
BEGIN
  -- Buscar configuração do Asaas
  SELECT * INTO v_config FROM asaas_config WHERE company_id = p_company_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Configuração Asaas não encontrada');
  END IF;

  -- URL da API
  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Fazer requisição com captura de status HTTP
  WITH http_result AS (
    SELECT 
      (response).status as status_code,
      (response).content as content
    FROM http((
      'GET',
      v_api_url || '/pix/addressKeys',
      ARRAY[
        http_header('access_token', v_config.api_key),
        http_header('Content-Type', 'application/json')
      ],
      NULL,
      NULL
    )::http_request) as response
  )
  SELECT status_code, content INTO v_http_status, v_response FROM http_result;

  -- Retornar debug completo
  RETURN json_build_object(
    'success', true,
    'config_debug', json_build_object(
      'sandbox_mode', v_config.sandbox_mode,
      'api_key_prefix', LEFT(v_config.api_key, 20) || '...',
      'is_active', v_config.is_active
    ),
    'request_debug', json_build_object(
      'api_url', v_api_url || '/pix/addressKeys',
      'http_status', v_http_status
    ),
    'response_debug', json_build_object(
      'raw_response', v_response,
      'response_type', pg_typeof(v_response)::TEXT,
      'has_data_field', v_response ? 'data',
      'data_content', v_response->'data',
      'data_type', CASE WHEN v_response->'data' IS NOT NULL THEN pg_typeof(v_response->'data')::TEXT ELSE 'NULL' END,
      'object_field', v_response->>'object',
      'totalCount_field', v_response->>'totalCount'
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Erro interno: ' || SQLERRM);
END;
$$;

-- Dar permissões necessárias
GRANT EXECUTE ON FUNCTION create_asaas_payment_oficial TO authenticated;
GRANT EXECUTE ON FUNCTION check_asaas_payment_status TO authenticated;
GRANT EXECUTE ON FUNCTION debug_asaas_payment TO authenticated;
GRANT EXECUTE ON FUNCTION check_asaas_pix_keys TO authenticated;
GRANT EXECUTE ON FUNCTION create_asaas_pix_key TO authenticated;
GRANT EXECUTE ON FUNCTION debug_asaas_qr_code TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_pix_key TO authenticated;
GRANT EXECUTE ON FUNCTION debug_pix_keys_detailed TO authenticated;
