-- Corrigir políticas duplicadas da tabela categorias

-- Remover políticas conflitantes antigas
DROP POLICY IF EXISTS "Company manage categorias" ON public.categorias;
DROP POLICY IF EXISTS "Users can view their company categorias" ON public.categorias;
DROP POLICY IF EXISTS "Users can insert their company categorias" ON public.categorias;
DROP POLICY IF EXISTS "Users can update their company categorias" ON public.categorias;
DROP POLICY IF EXISTS "Users can delete their company categorias" ON public.categorias;

-- Criar políticas simplificadas e funcionais para categorias
CREATE POLICY "Authenticated users can view categorias"
ON public.categorias
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage categorias"
ON public.categorias
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);