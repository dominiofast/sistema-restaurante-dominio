-- Public read for add-on categories and product associations used in Cardápio Público
-- categorias_adicionais: allow SELECT to anon for active companies
ALTER TABLE public.categorias_adicionais ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categorias_adicionais' AND policyname = 'Public can view categorias_adicionais (cardapio)'
  ) THEN
    CREATE POLICY "Public can view categorias_adicionais (cardapio)"
    ON public.categorias_adicionais
    FOR SELECT
    USING (
      company_id IN (SELECT id FROM public.companies WHERE status = 'active')
    );
  END IF;
END$$;

-- produto_categorias_adicionais: allow SELECT for anon based on linked product/company status
ALTER TABLE public.produto_categorias_adicionais ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'produto_categorias_adicionais' AND policyname = 'Public can view produto_categorias_adicionais (cardapio)'
  ) THEN
    CREATE POLICY "Public can view produto_categorias_adicionais (cardapio)"
    ON public.produto_categorias_adicionais
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 
        FROM public.produtos p
        JOIN public.companies c ON c.id = p.company_id
        WHERE p.id = produto_id
          AND p.is_available = true
          AND c.status = 'active'
      )
    );
  END IF;
END$$;