-- Retry: create produtos public SELECT policy using single-line EXECUTE to avoid escape errors
DO $$
BEGIN
  IF to_regclass('public.produtos') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'produtos' AND policyname = 'Public can view available produtos (cardapio)'
    ) THEN
      EXECUTE 'CREATE POLICY "Public can view available produtos (cardapio)" ON public.produtos FOR SELECT USING (is_available = true AND company_id IN (SELECT id FROM public.companies WHERE status = ''active''))';
    END IF;
  END IF;
END$$;