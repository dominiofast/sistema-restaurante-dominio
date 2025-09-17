-- Fix RLS for facebook_pixel_configs with a permissive policy
-- Enable RLS (no-op if already enabled)
ALTER TABLE public.facebook_pixel_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'facebook_pixel_configs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.facebook_pixel_configs', pol.policyname);
  END LOOP;
END$$;

-- Create a permissive policy allowing all operations
CREATE POLICY "Allow all operations on facebook_pixel_configs"
ON public.facebook_pixel_configs
FOR ALL
USING (true)
WITH CHECK (true);
