-- Resetar todos os dados de cashback para iniciar do zero

-- Limpar todas as transações de cashback
DELETE FROM public.cashback_transactions;

-- Resetar todos os saldos de cashback dos clientes para zero
UPDATE public.customer_cashback 
SET saldo_cashback = 0, 
    updated_at = NOW();

-- Opcional: Resetar as configurações de cashback (descomente se necessário)
-- UPDATE public.cashback_config 
-- SET is_active = false, 
--     activated_at = NULL,
--     updated_at = NOW();

-- Comentário: Esta migração remove todas as transações de cashback
-- e zera os saldos de todos os clientes, permitindo um recomeço limpo
-- do sistema de cashback.