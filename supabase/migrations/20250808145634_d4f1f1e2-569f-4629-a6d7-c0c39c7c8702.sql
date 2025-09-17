-- Fix http_post schema and add logging
CREATE OR REPLACE FUNCTION public.call_auto_print_edge_on_pedido_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url TEXT := 'https://epqppxteicfuzdblbluq.functions.supabase.co/auto-print-pedido';
  v_payload TEXT;
  v_resp TEXT;
BEGIN
  -- Build payload
  v_payload := json_build_object(
    'pedido_id', NEW.id,
    'company_id', NEW.company_id
  )::text;

  -- Log start
  INSERT INTO public.ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type
  ) VALUES (
    NEW.company_id, NEW.telefone, NEW.nome,
    'AUTO-PRINT TRIGGER FIRED: Enviando POST para auto-print-pedido com pedido_id='|| NEW.id,
    'auto_print_trigger'
  );

  -- Use public.http_post (available in this project)
  PERFORM 1 FROM public.http_post(
    v_url,
    v_payload,
    'application/json'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but do not block insert
    INSERT INTO public.ai_conversation_logs (
      company_id, customer_phone, customer_name, message_content, message_type
    ) VALUES (
      NEW.company_id, NEW.telefone, NEW.nome,
      'AUTO-PRINT ERROR: ' || COALESCE(SQLERRM, 'unknown error') || ' para pedido_id='|| NEW.id,
      'auto_print_error'
    );
    RETURN NEW;
END;
$$;