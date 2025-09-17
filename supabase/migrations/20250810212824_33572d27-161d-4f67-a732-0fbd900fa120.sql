-- Loosen RLS for facebook_pixel_configs to work without Supabase auth session
ALTER TABLE public.facebook_pixel_configs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Drop any existing policies on the table to avoid conflicts
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='facebook_pixel_configs' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.facebook_pixel_configs', pol.policyname);
  END LOOP;
END$$;

-- Create a permissive policy allowing all operations (matches pattern used elsewhere in project)
CREATE POLICY "Allow all operations on facebook_pixel_configs"
ON public.facebook_pixel_configs
FOR ALL
USING (true)
WITH CHECK (true);

-- Ensure updated_at trigger exists
DROP TRIGGER IF EXISTS trg_facebook_pixel_configs_updated_at ON public.facebook_pixel_configs;
CREATE TRIGGER trg_facebook_pixel_configs_updated_at
BEFORE UPDATE ON public.facebook_pixel_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_facebook_pixel_configs_update();