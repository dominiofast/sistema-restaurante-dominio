-- Remover políticas complexas e criar políticas simples temporárias
DROP POLICY IF EXISTS "Users can view their company caixas" ON public.caixas;
DROP POLICY IF EXISTS "Users can insert their company caixas" ON public.caixas;
DROP POLICY IF EXISTS "Users can update their company caixas" ON public.caixas;
DROP POLICY IF EXISTS "Users can view their company caixa lancamentos" ON public.caixa_lancamentos;
DROP POLICY IF EXISTS "Users can insert their company caixa lancamentos" ON public.caixa_lancamentos;
DROP POLICY IF EXISTS "Users can update their company caixa lancamentos" ON public.caixa_lancamentos;
DROP POLICY IF EXISTS "Users can delete their company caixa lancamentos" ON public.caixa_lancamentos;

-- Criar políticas simples que permitem acesso a usuários autenticados
CREATE POLICY "Allow authenticated users to view caixas" ON public.caixas
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert caixas" ON public.caixas
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update caixas" ON public.caixas
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view caixa_lancamentos" ON public.caixa_lancamentos
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert caixa_lancamentos" ON public.caixa_lancamentos
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update caixa_lancamentos" ON public.caixa_lancamentos
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete caixa_lancamentos" ON public.caixa_lancamentos
FOR DELETE USING (auth.uid() IS NOT NULL);