
-- Ajustar políticas RLS para permitir inserção de pedido_itens sem autenticação
-- (necessário para o cardápio digital público funcionar)

-- Remover políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "Users can view pedido_itens of their company" ON public.pedido_itens;
DROP POLICY IF EXISTS "Users can insert pedido_itens for their company" ON public.pedido_itens;

-- Criar políticas mais permissivas para pedido_itens
CREATE POLICY "Allow public insert pedido_itens" 
ON public.pedido_itens FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select pedido_itens" 
ON public.pedido_itens FOR SELECT 
USING (true);

-- Fazer o mesmo para pedido_item_adicionais
DROP POLICY IF EXISTS "Users can view pedido_item_adicionais of their company" ON public.pedido_item_adicionais;
DROP POLICY IF EXISTS "Users can insert pedido_item_adicionais for their company" ON public.pedido_item_adicionais;

CREATE POLICY "Allow public insert pedido_item_adicionais" 
ON public.pedido_item_adicionais FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select pedido_item_adicionais" 
ON public.pedido_item_adicionais FOR SELECT 
USING (true);
