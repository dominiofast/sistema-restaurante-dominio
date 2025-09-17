-- Remover política de INSERT existente
DROP POLICY IF EXISTS "Allow super admins to insert companies" ON public.companies;

-- Criar nova política de INSERT corrigida
CREATE POLICY "Allow super admins to insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'super_admin' OR
  ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'super_admin') OR
  ((auth.jwt() -> 'raw_user_meta_data' ->> 'role')::text = 'super_admin')
);

-- Atualizar também a política de UPDATE para consistência
DROP POLICY IF EXISTS "Allow super admins to update companies" ON public.companies;

CREATE POLICY "Allow super admins to update companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'super_admin' OR
  ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'super_admin') OR
  ((auth.jwt() -> 'raw_user_meta_data' ->> 'role')::text = 'super_admin')
)
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'super_admin' OR
  ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'super_admin') OR
  ((auth.jwt() -> 'raw_user_meta_data' ->> 'role')::text = 'super_admin')
);

-- Atualizar também a política de DELETE para consistência
DROP POLICY IF EXISTS "Allow super admins to delete companies" ON public.companies;

CREATE POLICY "Allow super admins to delete companies"
ON public.companies
FOR DELETE
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'super_admin' OR
  ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'super_admin') OR
  ((auth.jwt() -> 'raw_user_meta_data' ->> 'role')::text = 'super_admin')
);