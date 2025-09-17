-- Ensure whatsapp_integrations supports two instances per company by purpose
-- 1) Add purpose column if missing
ALTER TABLE public.whatsapp_integrations
ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'primary';

-- 2) Backfill any NULLs to 'primary' just in case
UPDATE public.whatsapp_integrations SET purpose = 'primary' WHERE purpose IS NULL;

-- 3) Add CHECK constraint for allowed values if it doesn't exist
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

-- 4) Drop old unique constraint/index that forces single row per company
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'whatsapp_integrations_company_id_key'
  ) THEN
    ALTER TABLE public.whatsapp_integrations
    DROP CONSTRAINT whatsapp_integrations_company_id_key;
  END IF;
END$$;

DROP INDEX IF EXISTS public.whatsapp_integrations_company_id_idx;

-- 5) Create unique index on (company_id, purpose)
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_integrations_company_id_purpose_idx
ON public.whatsapp_integrations (company_id, purpose);