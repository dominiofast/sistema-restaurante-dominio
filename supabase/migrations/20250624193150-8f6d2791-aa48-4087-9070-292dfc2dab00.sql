
-- Criar políticas RLS para a tabela clientes
-- Permitir que usuários vejam apenas clientes de suas empresas
CREATE POLICY "Users can view company clients" 
  ON public.clientes 
  FOR SELECT 
  USING (true); -- Por enquanto permitir visualizar todos, depois podemos refinar

-- Permitir que usuários insiram clientes
CREATE POLICY "Users can create clients" 
  ON public.clientes 
  FOR INSERT 
  WITH CHECK (true); -- Por enquanto permitir inserir, depois podemos refinar

-- Permitir que usuários atualizem clientes
CREATE POLICY "Users can update clients" 
  ON public.clientes 
  FOR UPDATE 
  USING (true); -- Por enquanto permitir atualizar, depois podemos refinar

-- Permitir que usuários deletem clientes
CREATE POLICY "Users can delete clients" 
  ON public.clientes 
  FOR DELETE 
  USING (true); -- Por enquanto permitir deletar, depois podemos refinar
