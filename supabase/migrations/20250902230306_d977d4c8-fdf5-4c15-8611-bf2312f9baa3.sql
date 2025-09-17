-- Atualizar política RLS para cardápio público apenas mostrar adicionais ativos e disponíveis
DROP POLICY IF EXISTS "Anon select adicionais (cardapio)" ON public.adicionais;

CREATE POLICY "Anon select adicionais (cardapio)" 
ON public.adicionais 
FOR SELECT 
TO anon
USING (is_available = true AND is_active = true);