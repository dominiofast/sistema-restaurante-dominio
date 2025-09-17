-- DIAGNÓSTICO e CORREÇÃO do problema de RLS dos clientes

-- 1. Criar função helper para debug de usuário
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT uc.company_id 
  FROM user_companies uc 
  WHERE uc.user_id = auth.uid() 
  AND uc.is_active = true 
  LIMIT 1;
$$;

-- 2. Criar função helper para verificar role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role'),
    'user'
  );
$$;

-- 3. Remover a política problemática atual e criar nova mais simples
DROP POLICY IF EXISTS "Auth users view their company clients" ON public.clientes;

-- 4. Criar política mais simples que usa a função helper
CREATE POLICY "Company users can view their company clients"
ON public.clientes
FOR SELECT
TO authenticated
USING (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

-- 5. Política para INSERT/UPDATE/DELETE
CREATE POLICY "Company users can manage their company clients"
ON public.clientes
FOR INSERT, UPDATE, DELETE
TO authenticated
WITH CHECK (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

-- 6. Verificar as novas políticas
SELECT 'NOVAS POLÍTICAS CLIENTES' as status, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'clientes'
ORDER BY policyname;