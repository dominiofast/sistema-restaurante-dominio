-- Reset all cashback data
-- Clear all cashback transactions
DELETE FROM public.cashback_transactions;

-- Clear all customer cashback balances
DELETE FROM public.customer_cashback;

-- Reset cashback configurations to inactive
UPDATE public.cashback_config 
SET is_active = false, 
    percentual_cashback = 0.00,
    valor_minimo_compra = 0.00,
    updated_at = now();

-- Log the reset action
INSERT INTO public.ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) 
SELECT DISTINCT 
    company_id,
    'SYSTEM',
    'ADMIN',
    'CASHBACK RESET: Todos os dados de cashback foram zerados no sistema',
    'system_reset',
    now()
FROM public.cashback_config;