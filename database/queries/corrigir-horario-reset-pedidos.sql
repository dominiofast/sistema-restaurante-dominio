-- CORREÇÃO DO HORÁRIO DE RESET DOS PEDIDOS
-- Problema: Cron job estava executando às 00:01 UTC (21:00 horário local)
-- Solução: Ajustar para executar às 00:01 no horário local (Brasil)

-- 1. Remover o cron job antigo
SELECT cron.unschedule('reset-daily-pedido-sequences');

-- 2. Criar novo cron job que executa às 00:01 no horário local (Brasil)
-- Como o Supabase roda em UTC, precisamos ajustar para 03:01 UTC (00:01 BRT)
SELECT cron.schedule(
    'reset-daily-pedido-sequences-brt',
    '1 3 * * *', -- Todos os dias às 03:01 UTC (00:01 BRT)
    $$
    SELECT reset_all_daily_pedido_sequences();
    $$
);

-- 3. Verificar se o job foi criado corretamente
SELECT 
    jobid,
    jobname,
    schedule,
    active
FROM cron.job 
WHERE jobname = 'reset-daily-pedido-sequences-brt';

-- 4. Log da correção
INSERT INTO public.ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    (SELECT id FROM companies WHERE status = 'active' LIMIT 1),
    'SYSTEM',
    'TIMEZONE_FIX',
    'CORREÇÃO DE FUSO HORÁRIO: Reset de pedidos ajustado para 00:01 BRT (03:01 UTC)',
    'system_fix',
    now()
);

-- 5. Comentário explicativo
COMMENT ON FUNCTION public.reset_all_daily_pedido_sequences() IS 
'Reseta todas as sequências de pedidos diárias. Executa às 00:01 BRT (03:01 UTC) via cron job.';

-- 6. Verificar todos os cron jobs ativos
SELECT 
    jobid,
    jobname,
    schedule,
    active,
    created_at
FROM cron.job 
WHERE active = true
ORDER BY jobname;
