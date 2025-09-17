-- Add missing public SELECT policy for produtos (fix previous syntax error)
DO $$
BEGIN
  IF to_regclass('public.produtos') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'produtos' AND policyname = 'Public can view available produtos (cardapio)'
    ) THEN
      EXECUTE 'CREATE POLICY "Public can view available produtos (cardapio)"\n        ON public.produtos\n        FOR SELECT\n        USING (\n          is_available = true\n          AND company_id IN (\n            SELECT id FROM public.companies WHERE status = ''active''\n          )\n        );';
    END IF;
  END IF;
END$$;