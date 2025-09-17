-- Create mapping table for agent_slug -> assistant_id
CREATE TABLE IF NOT EXISTS public.ai_assistant_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug text NOT NULL UNIQUE,
  assistant_id text NOT NULL,
  company_id uuid NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_assistant_mappings ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can manage; public can read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_assistant_mappings' AND policyname = 'authenticated users can manage ai_assistant_mappings'
  ) THEN
    CREATE POLICY "authenticated users can manage ai_assistant_mappings"
    ON public.ai_assistant_mappings
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_assistant_mappings' AND policyname = 'public read ai_assistant_mappings'
  ) THEN
    CREATE POLICY "public read ai_assistant_mappings"
    ON public.ai_assistant_mappings
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_ai_assistant_mappings_updated_at'
  ) THEN
    CREATE TRIGGER update_ai_assistant_mappings_updated_at
    BEFORE UPDATE ON public.ai_assistant_mappings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Function to notify edge function when a prompt changes
CREATE OR REPLACE FUNCTION public.notify_sync_assistant()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  supabase_url text := 'https://epqppxteicfuzdblbluq.supabase.co';
  _resp http_response;
  _payload text;
BEGIN
  -- Build payload with the agent_slug that changed
  _payload := json_build_object('agent_slug', NEW.agent_slug)::text;

  -- Fire-and-forget call to the edge function (public endpoint)
  PERFORM http( (
    'POST',
    supabase_url || '/functions/v1/sync-assistant',
    ARRAY[
      http_header('Content-Type','application/json'),
      http_header('X-Source','db-trigger')
    ],
    'application/json',
    _payload
  ) );

  RETURN NEW;
END;
$$;

-- Trigger on ai_agent_prompts to notify sync on inserts and updates
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'ai_agent_prompts'
  ) THEN
    -- Drop old trigger if exists to avoid duplicates
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ai_agent_prompts_sync_assistant') THEN
      DROP TRIGGER ai_agent_prompts_sync_assistant ON public.ai_agent_prompts;
    END IF;

    CREATE TRIGGER ai_agent_prompts_sync_assistant
    AFTER INSERT OR UPDATE ON public.ai_agent_prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_sync_assistant();
  END IF;
END $$;