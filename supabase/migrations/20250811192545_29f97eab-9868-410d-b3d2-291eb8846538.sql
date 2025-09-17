-- Corrigir políticas RLS da tabela cardapio_branding para permitir inserção

-- Remover políticas existentes
DROP POLICY IF EXISTS "Company manage branding" ON public.cardapio_branding;
DROP POLICY IF EXISTS "Public can view active branding" ON public.cardapio_branding;

-- Criar políticas RLS mais específicas e funcionais
CREATE POLICY "Company users can view branding" 
ON public.cardapio_branding 
FOR SELECT 
TO authenticated
USING (
  company_id = get_user_company_id() OR 
  get_user_role() = 'super_admin'
);

CREATE POLICY "Company users can insert branding" 
ON public.cardapio_branding 
FOR INSERT 
TO authenticated
WITH CHECK (
  company_id = get_user_company_id() OR 
  get_user_role() = 'super_admin'
);

CREATE POLICY "Company users can update branding" 
ON public.cardapio_branding 
FOR UPDATE 
TO authenticated
USING (
  company_id = get_user_company_id() OR 
  get_user_role() = 'super_admin'
)
WITH CHECK (
  company_id = get_user_company_id() OR 
  get_user_role() = 'super_admin'
);

CREATE POLICY "Company users can delete branding" 
ON public.cardapio_branding 
FOR DELETE 
TO authenticated
USING (
  company_id = get_user_company_id() OR 
  get_user_role() = 'super_admin'
);

-- Política para acesso público (cardápio público)
CREATE POLICY "Public can view active branding" 
ON public.cardapio_branding 
FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Verificar se RLS está habilitado
ALTER TABLE public.cardapio_branding ENABLE ROW LEVEL SECURITY;