-- Adicionar política para permitir criação de empresas durante signup
CREATE POLICY "Allow company creation during signup" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  -- Permitir criação se o usuário não está autenticado (processo de signup)
  auth.uid() IS NULL OR 
  -- Ou se é um super admin
  get_user_role() = 'super_admin'
);