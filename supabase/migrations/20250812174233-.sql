-- Criar índice composto para otimizar buscas de pedidos por empresa + número
CREATE INDEX IF NOT EXISTS idx_pedidos_company_numero 
ON public.pedidos (company_id, numero_pedido, created_at DESC);

-- Comentário explicativo
COMMENT ON INDEX idx_pedidos_company_numero IS 'Índice para otimizar busca de pedidos por empresa e número, ordenados por data de criação';