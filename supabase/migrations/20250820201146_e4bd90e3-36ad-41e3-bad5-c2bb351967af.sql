-- CORREÇÃO da sintaxe e criação das políticas corretas

-- 1. Criar função helper para debug de usuário (se não existir)
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

-- 2. Criar função helper para verificar role (se não existir)
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

-- 3. Remover políticas problemáticas
DROP POLICY IF EXISTS "Auth users view their company clients" ON public.clientes;

-- 4. Criar políticas separadas para cada operação
CREATE POLICY "Company users can view their company clients"
ON public.clientes
FOR SELECT
TO authenticated
USING (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

CREATE POLICY "Company users can insert their company clients"
ON public.clientes
FOR INSERT
TO authenticated
WITH CHECK (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

CREATE POLICY "Company users can update their company clients"
ON public.clientes
FOR UPDATE
TO authenticated
USING (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
)
WITH CHECK (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

CREATE POLICY "Company users can delete their company clients"
ON public.clientes
FOR DELETE
TO authenticated
USING (
    company_id = get_user_company_id() OR get_user_role() = 'super_admin'
);

-- 5. Verificar políticas finais
SELECT 'POLÍTICAS CLIENTES CORRIGIDAS' as status, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'clientes' AND roles = '{authenticated}'
ORDER BY policyname;