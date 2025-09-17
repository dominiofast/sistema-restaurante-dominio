-- Primeiro, desabilitar RLS temporariamente e remover todas as políticas problemáticas
ALTER TABLE public.cardapio_branding DISABLE ROW LEVEL SECURITY;

-- Dropar todas as políticas existentes de cardapio_branding
DROP POLICY IF EXISTS "Allow authenticated users to insert branding" ON public.cardapio_branding;
DROP POLICY IF EXISTS "Allow authenticated users to update branding" ON public.cardapio_branding;
DROP POLICY IF EXISTS "Allow public read for active branding" ON public.cardapio_branding;
DROP POLICY IF EXISTS "Users can view branding of their company" ON public.cardapio_branding;

-- Reabilitar RLS
ALTER TABLE public.cardapio_branding ENABLE ROW LEVEL SECURITY;

-- Criar políticas mais simples e funcionais
-- Permitir leitura pública para branding ativo
CREATE POLICY "Public can read active branding" 
ON public.cardapio_branding 
FOR SELECT 
USING (is_active = true);

-- Super admins podem fazer tudo
CREATE POLICY "Super admins can manage branding" 
ON public.cardapio_branding 
FOR ALL 
USING (auth.uid() IS NOT NULL AND 
       ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'))
WITH CHECK (auth.uid() IS NOT NULL AND 
           ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'));

-- Usuários autenticados podem inserir/atualizar para sua empresa
CREATE POLICY "Users can manage their company branding" 
ON public.cardapio_branding 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);