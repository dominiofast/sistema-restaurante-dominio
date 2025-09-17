-- ADICIONAR política temporária para debug - SOMENTE PARA TESTE!
CREATE POLICY "TEMP DEBUG - Allow all authenticated users to view clientes"
ON public.clientes
FOR SELECT
TO authenticated
USING (true);

-- Log para debug
SELECT 'POLÍTICA TEMPORÁRIA ADICIONADA' as status, 
       'ESTA POLÍTICA DEVE SER REMOVIDA APÓS O TESTE' as aviso;