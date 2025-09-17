-- Auto-print on new pedido inserts
-- Ensure http extension is available
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Clean up existing objects to make migration idempotent
DROP TRIGGER IF EXISTS trg_auto_print_pedido_insert ON public.pedidos;
DROP FUNCTION IF EXISTS public.call_auto_print_edge_on_pedido_insert();

-- Function: call Edge Function to auto-print a pedido after insert
CREATE OR REPLACE FUNCTION public.call_auto_print_edge_on_pedido_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url TEXT := 'https://epqppxteicfuzdblbluq.functions.supabase.co/auto-print-pedido';
  v_payload JSONB;
BEGIN
  -- Build payload with the inserted pedido id and company id
  v_payload := jsonb_build_object(
    'pedido_id', NEW.id,
    'company_id', NEW.company_id
  );

  -- Fire-and-forget HTTP POST to the Edge Function (do not block/raise on error)
  PERFORM 1 FROM extensions.http_post(
    v_url,
    v_payload::text,
    'application/json'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block inserts because of printing; just log a notice
    RAISE NOTICE 'auto-print http_post error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger: AFTER INSERT on pedidos
CREATE TRIGGER trg_auto_print_pedido_insert
AFTER INSERT ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.call_auto_print_edge_on_pedido_insert();
