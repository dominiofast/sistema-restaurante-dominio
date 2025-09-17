-- Remove qualquer trigger indevida em ai_agent_assistants que use funções que esperam NEW.agent_slug
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN 
    SELECT tgname 
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE c.relname = 'ai_agent_assistants'
      AND n.nspname = 'public'
      AND p.proname IN ('notify_edge_simple','notify_sync_assistant')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.ai_agent_assistants', r.tgname);
  END LOOP;
END $$;

-- Garantir que apenas o trigger de updated_at exista
DROP TRIGGER IF EXISTS trg_ai_agent_assistants_updated_at ON public.ai_agent_assistants;
CREATE TRIGGER trg_ai_agent_assistants_updated_at
BEFORE UPDATE ON public.ai_agent_assistants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();