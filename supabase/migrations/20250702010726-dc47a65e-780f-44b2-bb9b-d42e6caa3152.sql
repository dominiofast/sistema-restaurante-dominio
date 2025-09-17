-- Remover política existente com problema
DROP POLICY IF EXISTS "Super admins can manage company credentials" ON public.company_credentials;

-- Criar nova política corrigida que usa auth.jwt() em vez de consultar auth.users
CREATE POLICY "Super admins can manage company credentials"
ON public.company_credentials
FOR ALL
USING (
  (auth.jwt() ->> 'role')::text = 'super_admin' OR
  ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'super_admin') OR
  ((auth.jwt() -> 'raw_user_meta_data' ->> 'role')::text = 'super_admin')
);