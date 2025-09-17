
-- Criar tabela para armazenar os itens dos pedidos
CREATE TABLE public.pedido_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  nome_produto TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para armazenar os adicionais dos itens
CREATE TABLE public.pedido_item_adicionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_item_id UUID NOT NULL REFERENCES public.pedido_itens(id) ON DELETE CASCADE,
  adicional_id UUID REFERENCES public.adicionais(id),
  nome_adicional TEXT NOT NULL,
  categoria_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para pedido_itens
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pedido_itens of their company" 
ON public.pedido_itens FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pedidos p 
    WHERE p.id = pedido_itens.pedido_id 
    AND can_access_company(p.company_id)
  )
);

CREATE POLICY "Users can insert pedido_itens for their company" 
ON public.pedido_itens FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pedidos p 
    WHERE p.id = pedido_itens.pedido_id 
    AND can_access_company(p.company_id)
  )
);

-- Adicionar RLS para pedido_item_adicionais
ALTER TABLE public.pedido_item_adicionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pedido_item_adicionais of their company" 
ON public.pedido_item_adicionais FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pedido_itens pi
    JOIN public.pedidos p ON p.id = pi.pedido_id
    WHERE pi.id = pedido_item_adicionais.pedido_item_id 
    AND can_access_company(p.company_id)
  )
);

CREATE POLICY "Users can insert pedido_item_adicionais for their company" 
ON public.pedido_item_adicionais FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pedido_itens pi
    JOIN public.pedidos p ON p.id = pi.pedido_id
    WHERE pi.id = pedido_item_adicionais.pedido_item_id 
    AND can_access_company(p.company_id)
  )
);

-- Adicionar índices para performance
CREATE INDEX idx_pedido_itens_pedido_id ON public.pedido_itens(pedido_id);
CREATE INDEX idx_pedido_item_adicionais_item_id ON public.pedido_item_adicionais(pedido_item_id);
