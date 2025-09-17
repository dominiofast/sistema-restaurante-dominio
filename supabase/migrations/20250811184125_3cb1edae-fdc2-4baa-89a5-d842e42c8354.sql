-- Ensure updated_at auto-updates on cardapio_branding
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.update_cardapio_branding_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_cardapio_branding_updated_at
  BEFORE UPDATE ON public.cardapio_branding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cardapio_branding_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

-- Enforce at most one active branding per company
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS ux_cardapio_branding_company_active
    ON public.cardapio_branding (company_id)
    WHERE is_active = true;
EXCEPTION WHEN others THEN NULL; END $$;