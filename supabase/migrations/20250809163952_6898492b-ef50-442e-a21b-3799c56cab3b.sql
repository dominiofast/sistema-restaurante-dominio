-- 1) Add purpose column with controlled values and backfill
ALTER TABLE public.whatsapp_integrations
ADD COLUMN IF NOT EXISTS purpose TEXT;

UPDATE public.whatsapp_integrations
SET purpose = 'primary'
WHERE purpose IS NULL;

ALTER TABLE public.whatsapp_integrations
ALTER COLUMN purpose SET DEFAULT 'primary';

ALTER TABLE public.whatsapp_integrations
ALTER COLUMN purpose SET NOT NULL;

-- Ensure only allowed purposes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'whatsapp_integrations_purpose_check'
  ) THEN
    ALTER TABLE public.whatsapp_integrations
    ADD CONSTRAINT whatsapp_integrations_purpose_check
    CHECK (purpose IN ('primary','marketing'));
  END IF;
END$$;

-- Unique per company and purpose
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'whatsapp_integrations_company_purpose_key'
  ) THEN
    ALTER TABLE public.whatsapp_integrations
    ADD CONSTRAINT whatsapp_integrations_company_purpose_key
    UNIQUE (company_id, purpose);
  END IF;
END$$;
