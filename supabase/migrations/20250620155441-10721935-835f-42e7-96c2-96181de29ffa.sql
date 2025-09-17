
-- Adicionar colunas para funcionalidade de promoção na tabela produtos
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS promotional_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS is_promotional BOOLEAN DEFAULT false;

-- Atualizar produtos existentes para não serem promocionais por padrão
UPDATE public.produtos 
SET is_promotional = false 
WHERE is_promotional IS NULL;
