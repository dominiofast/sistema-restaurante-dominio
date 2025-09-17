-- Adicionar campos para integração com plataformas externas na tabela pedidos
ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS external_platform VARCHAR(50),
ADD COLUMN IF NOT EXISTS external_status VARCHAR(100),
ADD COLUMN IF NOT EXISTS external_data JSONB;

-- Criar índice para busca por ID externo
CREATE INDEX IF NOT EXISTS idx_pedidos_external_id ON public.pedidos(external_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_external_platform ON public.pedidos(external_platform);

-- Comentários para documentação
COMMENT ON COLUMN public.pedidos.external_id IS 'ID do pedido na plataforma externa (ex: iFood, Uber Eats)';
COMMENT ON COLUMN public.pedidos.external_platform IS 'Nome da plataforma externa (ex: ifood, ubereats)';
COMMENT ON COLUMN public.pedidos.external_status IS 'Status original da plataforma externa';
COMMENT ON COLUMN public.pedidos.external_data IS 'Dados adicionais da plataforma externa em formato JSON';