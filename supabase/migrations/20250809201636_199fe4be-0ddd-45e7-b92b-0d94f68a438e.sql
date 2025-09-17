-- Create table to persist WhatsApp campaigns with basic recurrence fields
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  audience text NOT NULL,
  country text NOT NULL DEFAULT 'BR',
  message text NOT NULL,
  media_base64 text,
  media_mime_type text,
  media_file_name text,
  media_type text CHECK (media_type IN ('image','video','audio','ptt','document')),
  total_recipients integer NOT NULL DEFAULT 0,
  total_sent integer NOT NULL DEFAULT 0,
  total_failed integer NOT NULL DEFAULT 0,
  scheduled_date timestamptz,
  recurrence_type text NOT NULL DEFAULT 'once', -- 'once' | 'daily' | 'weekly'
  days_of_week smallint[], -- 0-6 (0=Sunday)
  time_of_day time without time zone,
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  next_run_at timestamptz,
  last_run_at timestamptz,
  status text NOT NULL DEFAULT 'draft', -- 'draft' | 'scheduled' | 'sent' | 'paused'
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies using get_user_company_id()
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'whatsapp_campaigns' AND policyname = 'Users can view their campaigns'
  ) THEN
    CREATE POLICY "Users can view their campaigns"
    ON public.whatsapp_campaigns
    FOR SELECT
    USING (company_id = public.get_user_company_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'whatsapp_campaigns' AND policyname = 'Users can insert their campaigns'
  ) THEN
    CREATE POLICY "Users can insert their campaigns"
    ON public.whatsapp_campaigns
    FOR INSERT
    WITH CHECK (company_id = public.get_user_company_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'whatsapp_campaigns' AND policyname = 'Users can update their campaigns'
  ) THEN
    CREATE POLICY "Users can update their campaigns"
    ON public.whatsapp_campaigns
    FOR UPDATE
    USING (company_id = public.get_user_company_id())
    WITH CHECK (company_id = public.get_user_company_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'whatsapp_campaigns' AND policyname = 'Users can delete their campaigns'
  ) THEN
    CREATE POLICY "Users can delete their campaigns"
    ON public.whatsapp_campaigns
    FOR DELETE
    USING (company_id = public.get_user_company_id());
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_company ON public.whatsapp_campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_next_run ON public.whatsapp_campaigns(next_run_at) WHERE is_active = true;

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS trg_whatsapp_campaigns_updated_at ON public.whatsapp_campaigns;
CREATE TRIGGER trg_whatsapp_campaigns_updated_at
BEFORE UPDATE ON public.whatsapp_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();