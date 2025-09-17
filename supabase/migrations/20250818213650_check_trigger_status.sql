CREATE OR REPLACE FUNCTION public.get_trigger_and_rls_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rls_enabled boolean;
  trigger_exists boolean;
BEGIN
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'pedido_itens'
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_whatsapp_notification'
    AND tgrelid = (SELECT oid FROM pg_class WHERE relname = 'pedido_itens' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
  ) INTO trigger_exists;

  IF rls_enabled IS NULL THEN
    rls_enabled := false;
  END IF;

  IF trigger_exists IS NULL THEN
    trigger_exists := false;
  END IF;

  RETURN json_build_object('rls', rls_enabled, 'trigger', trigger_exists);
END;
$$;