-- Fix RLS policies for facebook_pixel_configs (no IF NOT EXISTS)

-- Ensure RLS is enabled
ALTER TABLE public.facebook_pixel_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing related policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='facebook_pixel_configs' 
      AND policyname='Allow full access to own company''s pixel config'
  ) THEN
    EXECUTE 'DROP POLICY "Allow full access to own company''s pixel config" ON public.facebook_pixel_configs;';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='facebook_pixel_configs' AND policyname='Pixel: select own company'
  ) THEN
    EXECUTE 'DROP POLICY "Pixel: select own company" ON public.facebook_pixel_configs;';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='facebook_pixel_configs' AND policyname='Pixel: insert own company'
  ) THEN
    EXECUTE 'DROP POLICY "Pixel: insert own company" ON public.facebook_pixel_configs;';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='facebook_pixel_configs' AND policyname='Pixel: update own company'
  ) THEN
    EXECUTE 'DROP POLICY "Pixel: update own company" ON public.facebook_pixel_configs;';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='facebook_pixel_configs' AND policyname='Pixel: delete own company'
  ) THEN
    EXECUTE 'DROP POLICY "Pixel: delete own company" ON public.facebook_pixel_configs;';
  END IF;
END$$;

-- Create granular policies
CREATE POLICY "Pixel: select own company" 
  ON public.facebook_pixel_configs
  FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Pixel: insert own company" 
  ON public.facebook_pixel_configs
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Pixel: update own company" 
  ON public.facebook_pixel_configs
  FOR UPDATE
  USING (company_id = public.get_my_company_id())
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Pixel: delete own company" 
  ON public.facebook_pixel_configs
  FOR DELETE
  USING (company_id = public.get_my_company_id());

-- Ensure updated_at trigger exists
DROP TRIGGER IF EXISTS trg_facebook_pixel_configs_updated_at ON public.facebook_pixel_configs;
CREATE TRIGGER trg_facebook_pixel_configs_updated_at
BEFORE UPDATE ON public.facebook_pixel_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_facebook_pixel_configs_update();