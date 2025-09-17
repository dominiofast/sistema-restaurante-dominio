-- Permitir inserção pública de pedidos na tabela pedidos para o cardápio público
-- Isso é necessário para clientes não autenticados fazerem pedidos

-- Remover a policy restritiva atual
DROP POLICY IF EXISTS "Users can insert pedidos for their company" ON public.pedidos;

-- Criar nova policy que permite inserção pública
CREATE POLICY "Allow public insert of pedidos" 
ON public.pedidos 
FOR INSERT 
WITH CHECK (true);

-- Manter as outras policies para SELECT e UPDATE apenas para usuários autenticados
-- (elas já existem e estão corretas)