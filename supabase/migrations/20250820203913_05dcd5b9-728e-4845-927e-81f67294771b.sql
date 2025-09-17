-- Verificar e corrigir TODAS as políticas da tabela categorias
-- Remover TODAS as políticas existentes para começar limpo
DROP POLICY IF EXISTS "Anon select categorias (cardapio)" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated users can view categorias" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated users can manage categorias" ON public.categorias;

-- Recriar políticas básicas e funcionais
-- Política para usuários anônimos (público)
CREATE POLICY "Public can view active categorias"
ON public.categorias
FOR SELECT
TO anon, public
USING (is_active = true);

-- Políticas para usuários autenticados (mais permissivas para resolver o problema)
CREATE POLICY "Authenticated users can view all categorias"
ON public.categorias
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert categorias"
ON public.categorias
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update categorias"
ON public.categorias
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categorias"
ON public.categorias
FOR DELETE
TO authenticated
USING (true);