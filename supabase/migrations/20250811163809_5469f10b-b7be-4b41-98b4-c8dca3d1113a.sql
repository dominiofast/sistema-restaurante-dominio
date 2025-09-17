-- Emergency visibility fix: allow anonymous SELECT for public menu
-- Ensure RLS is enabled and add anon-select policies (idempotent)

-- 1) categorias
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categorias' AND policyname = 'Anon select categorias (cardapio)'
  ) THEN
    CREATE POLICY "Anon select categorias (cardapio)"
    ON public.categorias
    FOR SELECT TO anon
    USING (is_active = true);
  END IF;
END$$;

-- 2) produtos
DO $$
BEGIN
  IF to_regclass('public.produtos') IS NOT NULL THEN
    ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'produtos' AND policyname = 'Anon select produtos (cardapio)'
    ) THEN
      CREATE POLICY "Anon select produtos (cardapio)"
      ON public.produtos
      FOR SELECT TO anon
      USING (is_available = true);
    END IF;
  END IF;
END$$;

-- 3) categorias_adicionais
ALTER TABLE public.categorias_adicionais ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categorias_adicionais' AND policyname = 'Anon select categorias_adicionais (cardapio)'
  ) THEN
    CREATE POLICY "Anon select categorias_adicionais (cardapio)"
    ON public.categorias_adicionais
    FOR SELECT TO anon
    USING (true);
  END IF;
END$$;

-- 4) produto_categorias_adicionais
DO $$
BEGIN
  IF to_regclass('public.produto_categorias_adicionais') IS NOT NULL THEN
    ALTER TABLE public.produto_categorias_adicionais ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'produto_categorias_adicionais' AND policyname = 'Anon select produto_categorias_adicionais (cardapio)'
    ) THEN
      CREATE POLICY "Anon select produto_categorias_adicionais (cardapio)"
      ON public.produto_categorias_adicionais
      FOR SELECT TO anon
      USING (true);
    END IF;
  END IF;
END$$;

-- 5) adicionais (defensive)
ALTER TABLE public.adicionais ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'adicionais' AND policyname = 'Anon select adicionais (cardapio)'
  ) THEN
    CREATE POLICY "Anon select adicionais (cardapio)"
    ON public.adicionais
    FOR SELECT TO anon
    USING (is_available = true);
  END IF;
END$$;