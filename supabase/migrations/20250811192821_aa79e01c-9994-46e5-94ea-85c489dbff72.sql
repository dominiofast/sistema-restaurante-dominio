-- Temporariamente criar política mais permissiva para debug
DROP POLICY IF EXISTS "Company users can insert branding" ON public.cardapio_branding;
DROP POLICY IF EXISTS "Company users can update branding" ON public.cardapio_branding;

-- Política temporária mais permissiva para INSERT (qualquer usuário autenticado)
CREATE POLICY "Temp: authenticated can insert branding" 
ON public.cardapio_branding 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Política temporária mais permissiva para UPDATE (qualquer usuário autenticado)
CREATE POLICY "Temp: authenticated can update branding" 
ON public.cardapio_branding 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar o que retorna get_user_company_id() vs company_id atual
-- Esta query vai nos ajudar a debugar
SELECT 
  get_user_company_id() as user_company_from_function,
  auth.uid() as user_id,
  (auth.jwt() -> 'user_metadata' ->> 'company_id')::UUID as company_id_from_jwt;