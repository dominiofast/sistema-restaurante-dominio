-- Criar tabela para rastrear status individual dos itens
CREATE TABLE public.pedido_item_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_item_id UUID NOT NULL REFERENCES public.pedido_itens(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT
);

-- Índices para performance
CREATE INDEX idx_pedido_item_status_item_id ON public.pedido_item_status(pedido_item_id);
CREATE INDEX idx_pedido_item_status_status ON public.pedido_item_status(status);

-- RLS
ALTER TABLE public.pedido_item_status ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view item status" 
ON public.pedido_item_status 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert item status" 
ON public.pedido_item_status 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update item status" 
ON public.pedido_item_status 
FOR UPDATE 
USING (true);

-- Trigger para atualizar timestamp
CREATE TRIGGER update_pedido_item_status_updated_at
  BEFORE UPDATE ON public.pedido_item_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar status inicial dos itens quando um pedido é criado
CREATE OR REPLACE FUNCTION public.create_initial_item_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir status inicial para o novo item
  INSERT INTO public.pedido_item_status (pedido_item_id, status)
  VALUES (NEW.id, 'pendente');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar status inicial automaticamente
CREATE TRIGGER trigger_create_initial_item_status
  AFTER INSERT ON public.pedido_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.create_initial_item_status();