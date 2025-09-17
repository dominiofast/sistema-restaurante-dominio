-- Fix public visibility for Cardápio Público without affecting admin mutations
-- 1) Categorias: replace restrictive ALL policy with scoped policies

-- Ensure RLS is enabled (noop if already enabled)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Drop legacy restrictive policy if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categorias' AND policyname = 'Company manage categorias'
  ) THEN
    EXECUTE 'DROP POLICY "Company manage categorias" ON public.categorias';
  END IF;
END$$;

-- Public read: only active categories from active companies
CREATE POLICY "Public can view active categorias (cardapio)"
ON public.categorias
FOR SELECT
USING (
  is_active = true
  AND company_id IN (
    SELECT id FROM public.companies WHERE status = 'active'
  )
);

-- Authenticated mutations: keep company/super_admin control
CREATE POLICY "Company can insert categorias"
ON public.categorias
FOR INSERT TO authenticated
WITH CHECK ((company_id = get_user_company_id()) OR (get_user_role() = 'super_admin'));

CREATE POLICY "Company can update categorias"
ON public.categorias
FOR UPDATE TO authenticated
USING ((company_id = get_user_company_id()) OR (get_user_role() = 'super_admin'))
WITH CHECK ((company_id = get_user_company_id()) OR (get_user_role() = 'super_admin'));

CREATE POLICY "Company can delete categorias"
ON public.categorias
FOR DELETE TO authenticated
USING ((company_id = get_user_company_id()) OR (get_user_role() = 'super_admin'));


-- 2) Produtos: allow public read of available items from active companies
-- Do NOT alter mutation policies here; only add a scoped public-SELECT policy
DO $$
BEGIN
  IF to_regclass('public.produtos') IS NOT NULL THEN
    -- Ensure RLS is enabled if already in use; skip enabling to avoid breaking flows
    -- Add a new SELECT policy for public menu visibility
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'produtos' AND policyname = 'Public can view available produtos (cardapio)'
    ) THEN
      EXECUTE $$
        CREATE POLICY "Public can view available produtos (cardapio)"
        ON public.produtos
        FOR SELECT
        USING (
          is_available = true
          AND company_id IN (
            SELECT id FROM public.companies WHERE status = 'active'
          )
        );
      $$;
    END IF;
  END IF;
END$$;