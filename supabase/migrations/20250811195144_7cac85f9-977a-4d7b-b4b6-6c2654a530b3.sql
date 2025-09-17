-- Remover políticas temporárias
DROP POLICY IF EXISTS "Temp: authenticated can insert branding" ON public.cardapio_branding;
DROP POLICY IF EXISTS "Temp: authenticated can update branding" ON public.cardapio_branding;

-- Criar função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role'),
    'user'
  );
$$;

-- Políticas corretas para INSERT
CREATE POLICY "Super admins can insert any branding"
ON public.cardapio_branding
FOR INSERT
TO authenticated
WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Company users can insert their branding"
ON public.cardapio_branding
FOR INSERT
TO authenticated
WITH CHECK (
  get_user_role() != 'super_admin' AND
  company_id = get_user_company_id()
);

-- Políticas corretas para UPDATE
CREATE POLICY "Super admins can update any branding"
ON public.cardapio_branding
FOR UPDATE
TO authenticated
USING (get_user_role() = 'super_admin')
WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Company users can update their branding"
ON public.cardapio_branding
FOR UPDATE
TO authenticated
USING (
  get_user_role() != 'super_admin' AND
  company_id = get_user_company_id()
)
WITH CHECK (
  get_user_role() != 'super_admin' AND
  company_id = get_user_company_id()
);

-- Políticas corretas para DELETE
CREATE POLICY "Super admins can delete any branding"
ON public.cardapio_branding
FOR DELETE
TO authenticated
USING (get_user_role() = 'super_admin');

CREATE POLICY "Company users can delete their branding"
ON public.cardapio_branding
FOR DELETE
TO authenticated
USING (
  get_user_role() != 'super_admin' AND
  company_id = get_user_company_id()
);