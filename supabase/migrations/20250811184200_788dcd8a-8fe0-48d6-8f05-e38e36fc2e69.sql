-- Function to auto-update updated_at on cardapio_branding
CREATE OR REPLACE FUNCTION public.update_cardapio_branding_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to call the function on update
DROP TRIGGER IF EXISTS trg_cardapio_branding_updated_at ON public.cardapio_branding;
CREATE TRIGGER trg_cardapio_branding_updated_at
BEFORE UPDATE ON public.cardapio_branding
FOR EACH ROW
EXECUTE FUNCTION public.update_cardapio_branding_updated_at();

-- Unique partial index to ensure only one active branding per company
CREATE UNIQUE INDEX IF NOT EXISTS ux_cardapio_branding_company_active
ON public.cardapio_branding (company_id)
WHERE is_active = true;