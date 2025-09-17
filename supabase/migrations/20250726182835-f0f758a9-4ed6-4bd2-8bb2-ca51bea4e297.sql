-- Adicionar coluna order_position à tabela produtos
ALTER TABLE public.produtos 
ADD COLUMN order_position integer DEFAULT 0;

-- Atualizar order_position existente baseado no nome para manter consistência
UPDATE public.produtos 
SET order_position = (
  SELECT ROW_NUMBER() OVER (PARTITION BY categoria_id ORDER BY name) - 1
  FROM (SELECT DISTINCT categoria_id FROM public.produtos) sub
  WHERE sub.categoria_id = produtos.categoria_id OR (sub.categoria_id IS NULL AND produtos.categoria_id IS NULL)
);

-- Criar índice para melhor performance
CREATE INDEX idx_produtos_order_position ON public.produtos(categoria_id, order_position);