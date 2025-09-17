-- Remover trigger problemático que usa extensão 'net'
DROP TRIGGER IF EXISTS trg_push_prompt ON public.ai_agent_prompts;
DROP FUNCTION IF EXISTS public.notify_edge();

-- Criar uma função simples de trigger que apenas faz log
CREATE OR REPLACE FUNCTION public.notify_edge_simple()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas registrar que houve mudança (o push será feito manualmente via interface)
  RAISE NOTICE 'Prompt atualizado para agent_slug: %', NEW.agent_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger simplificado
CREATE TRIGGER trg_log_prompt_change
  AFTER INSERT OR UPDATE ON public.ai_agent_prompts
  FOR EACH ROW EXECUTE FUNCTION public.notify_edge_simple();