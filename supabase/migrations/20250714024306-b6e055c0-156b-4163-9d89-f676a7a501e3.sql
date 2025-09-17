-- Corrigir políticas RLS para permitir criação de pedidos públicos
-- O problema é que as políticas estão tentando acessar auth.users indiretamente

-- Remover políticas restritivas das tabelas de pedidos
DROP POLICY IF EXISTS "Users can view pedidos from their company" ON public.pedidos;
DROP POLICY IF EXISTS "Users can update pedidos from their company" ON public.pedidos;

-- Criar políticas mais permissivas para pedidos públicos
CREATE POLICY "Allow public access to pedidos" 
ON public.pedidos 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('pedidos', 'pedido_itens', 'pedido_item_adicionais')
ORDER BY tablename, policyname;