-- Implementação OFICIAL seguindo documentação Asaas
-- Baseado em: https://docs.asaas.com/reference/criar-nova-cobranca

CREATE OR REPLACE FUNCTION create_asaas_payment_oficial(
  p_company_id UUID,
  p_amount DECIMAL,
  p_description TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_config RECORD;
  v_response JSON;
  v_api_url TEXT;
  v_customer_email TEXT;
BEGIN
  -- Buscar config
  SELECT * INTO v_config FROM asaas_config WHERE company_id = p_company_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Config não encontrada');
  END IF;

  v_api_url := CASE 
    WHEN v_config.sandbox_mode THEN 'https://sandbox.asaas.com/api/v3'
    ELSE 'https://www.asaas.com/api/v3'
  END;

  -- Email baseado no telefone
  v_customer_email := COALESCE(REPLACE(p_customer_phone, ' ', '') || '@temp.com', 'cliente@temp.com');

  -- Criar cobrança diretamente (sem criar cliente separado)
  SELECT content INTO v_response
  FROM http((
    'POST',
    v_api_url || '/payments',
    ARRAY[
      http_header('access_token', v_config.api_key),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    json_build_object(
      'billingType', 'PIX',
      'value', p_amount,
      'description', p_description,
      'dueDate', CURRENT_DATE::TEXT,
      'customer', json_build_object(
        'name', p_customer_name,
        'email', v_customer_email
      )
    )::TEXT
  )::http_request);

  -- Retornar resposta bruta para debug
  RETURN json_build_object(
    'success', v_response->>'id' IS NOT NULL,
    'response', v_response,
    'api_url', v_api_url,
    'sandbox_mode', v_config.sandbox_mode
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

GRANT EXECUTE ON FUNCTION create_asaas_payment_oficial TO authenticated;
