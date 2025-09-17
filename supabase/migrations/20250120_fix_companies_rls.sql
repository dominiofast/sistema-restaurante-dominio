-- Adicionar política para permitir que usuários autenticados vejam empresas
-- Isso é necessário para que o sistema possa carregar as empresas corretamente

-- Primeiro, remover TODAS as políticas existentes da tabela companies
DROP POLICY IF EXISTS "Super admins can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Super admins can create companies" ON public.companies;
DROP POLICY IF EXISTS "Super admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Super admins can delete companies" ON public.companies;
DROP POLICY IF EXISTS "Super admins can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can read company slug for public menu" ON public.companies;

-- Criar nova política que permite:
-- 1. Todos os usuários autenticados verem empresas (necessário para o sistema funcionar)
CREATE POLICY "Authenticated users can view companies" 
  ON public.companies 
  FOR SELECT 
  USING (
    auth.role() = 'authenticated'
  );

-- Políticas para super admins gerenciarem empresas
CREATE POLICY "Super admins can insert companies" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Super admins can update companies" 
  ON public.companies 
  FOR UPDATE 
  USING (
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Super admins can delete companies" 
  ON public.companies 
  FOR DELETE 
  USING (
    auth.jwt() ->> 'role' = 'super_admin'
  );

-- Recriar a política para leitura pública do slug (necessário para cardápio público)
CREATE POLICY "Anyone can read company slug for public menu" 
  ON public.companies 
  FOR SELECT 
  USING (true); 