-- LIMPEZA de políticas duplicadas em clientes
DROP POLICY IF EXISTS "Auth users delete their company clients" ON public.clientes;

-- Verificar estado final das políticas
SELECT 'POLÍTICAS FINAIS CLIENTES' as status, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'clientes'
ORDER BY policyname;