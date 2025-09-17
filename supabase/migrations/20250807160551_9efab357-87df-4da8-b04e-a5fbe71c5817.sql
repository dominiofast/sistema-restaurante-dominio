-- Criar função para notificar edge function
CREATE OR REPLACE FUNCTION public.notify_edge()
RETURNS TRIGGER AS $$
DECLARE
  _url TEXT := 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/push_prompt_to_edge';
BEGIN
  -- Chama a função HTTP de forma assíncrona
  PERFORM net.http_post(_url, json_build_object('agent_slug', NEW.agent_slug));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar após INSERT ou UPDATE
CREATE TRIGGER trg_push_prompt
  AFTER INSERT OR UPDATE ON public.ai_agent_prompts
  FOR EACH ROW EXECUTE FUNCTION public.notify_edge();