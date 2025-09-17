-- Remover políticas existentes que fazem referência a auth.users
DROP POLICY IF EXISTS "Users can manage their company's fiscal data" ON public.dados_fiscais;
DROP POLICY IF EXISTS "Users can manage their company's fiscal types" ON public.tipos_fiscais;

-- Criar políticas simples que permitem acesso total para autenticação de empresa
CREATE POLICY "Allow all operations for fiscal data" 
ON public.dados_fiscais 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations for fiscal types" 
ON public.tipos_fiscais 
FOR ALL 
USING (true)
WITH CHECK (true);