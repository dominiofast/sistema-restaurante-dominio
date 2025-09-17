-- Adicionar coluna para chave PIX na configuração de pagamento
ALTER TABLE public.payment_delivery_config ADD COLUMN pix_key TEXT;

-- Atualizar RLS se necessário (já que RLS está ativado)
-- A política existente deve cobrir, mas confirmar

-- Opcional: adicionar índice se for usado em buscas
CREATE INDEX IF NOT EXISTS idx_payment_delivery_pix_key ON public.payment_delivery_config(pix_key);