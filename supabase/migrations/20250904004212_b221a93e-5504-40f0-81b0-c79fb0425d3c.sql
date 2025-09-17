-- Adicionar colunas para controle de cashback nos pedidos
ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS cashback_usado NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sem_desconto NUMERIC DEFAULT 0;

-- Comentário explicativo sobre as novas colunas
COMMENT ON COLUMN public.pedidos.cashback_usado IS 'Valor de cashback aplicado como desconto no pedido';
COMMENT ON COLUMN public.pedidos.total_sem_desconto IS 'Valor total do pedido antes da aplicação do cashback';

-- Atualizar registros existentes para manter consistência
UPDATE public.pedidos 
SET 
    total_sem_desconto = CASE WHEN total_sem_desconto = 0 THEN total ELSE total_sem_desconto END,
    cashback_usado = COALESCE(cashback_usado, 0)
WHERE total_sem_desconto = 0 OR cashback_usado IS NULL;