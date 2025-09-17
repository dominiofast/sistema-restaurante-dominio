-- Adicionar campo tipo_fiscal_id na tabela categorias
ALTER TABLE public.categorias 
ADD COLUMN tipo_fiscal_id UUID REFERENCES public.tipos_fiscais(id);

-- Adicionar campo tipo_fiscal_id na tabela produtos  
ALTER TABLE public.produtos 
ADD COLUMN tipo_fiscal_id UUID REFERENCES public.tipos_fiscais(id);

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.categorias.tipo_fiscal_id IS 'Referência ao tipo fiscal padrão da categoria';
COMMENT ON COLUMN public.produtos.tipo_fiscal_id IS 'Referência ao tipo fiscal específico do produto (override da categoria)';