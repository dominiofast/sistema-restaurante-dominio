-- Adjust RLS for facebook_pixel_configs to use membership table user_companies
ALTER TABLE public.facebook_pixel_configs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='facebook_pixel_configs' AND policyname='Pixel: select own company') THEN
    EXECUTE 'DROP POLICY "Pixel: select own company" ON public.facebook_pixel_configs;';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='facebook_pixel_configs' AND policyname='Pixel: insert own company') THEN
    EXECUTE 'DROP POLICY "Pixel: insert own company" ON public.facebook_pixel_configs;';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='facebook_pixel_configs' AND policyname='Pixel: update own company') THEN
    EXECUTE 'DROP POLICY "Pixel: update own company" ON public.facebook_pixel_configs;';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='facebook_pixel_configs' AND policyname='Pixel: delete own company') THEN
    EXECUTE 'DROP POLICY "Pixel: delete own company" ON public.facebook_pixel_configs;';
  END IF;
END$$;

CREATE POLICY "Pixel: select by membership" ON public.facebook_pixel_configs
FOR SELECT
USING (
  company_id IN (
    SELECT uc.company_id FROM public.user_companies uc WHERE uc.user_id = auth.uid()
  )
);

CREATE POLICY "Pixel: insert by membership" ON public.facebook_pixel_configs
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT uc.company_id FROM public.user_companies uc WHERE uc.user_id = auth.uid()
  )
);

CREATE POLICY "Pixel: update by membership" ON public.facebook_pixel_configs
FOR UPDATE
USING (
  company_id IN (
    SELECT uc.company_id FROM public.user_companies uc WHERE uc.user_id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT uc.company_id FROM public.user_companies uc WHERE uc.user_id = auth.uid()
  )
);

CREATE POLICY "Pixel: delete by membership" ON public.facebook_pixel_configs
FOR DELETE
USING (
  company_id IN (
    SELECT uc.company_id FROM public.user_companies uc WHERE uc.user_id = auth.uid()
  )
);

-- Keep updated_at trigger intact
DROP TRIGGER IF EXISTS trg_facebook_pixel_configs_updated_at ON public.facebook_pixel_configs;
CREATE TRIGGER trg_facebook_pixel_configs_updated_at
BEFORE UPDATE ON public.facebook_pixel_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_facebook_pixel_configs_update();