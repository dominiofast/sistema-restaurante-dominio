-- 🚫 DESATIVAR CRON JOB QUE PROCESSA CAMPANHAS WHATSAPP A CADA MINUTO
SELECT cron.unschedule('process-whatsapp-campaigns-every-minute');

-- 🚫 DESATIVAR CRON JOB DE AI AUTO-SETUP  
SELECT cron.unschedule('ai-auto-setup-every-5min');

-- Verificar quais jobs ainda estão ativos
SELECT 
    jobname, 
    schedule, 
    active,
    CASE 
        WHEN command ILIKE '%whatsapp%' THEN 'WHATSAPP_RELATED'
        WHEN command ILIKE '%ai%' THEN 'AI_RELATED'
        ELSE 'OTHER'
    END as tipo
FROM cron.job 
WHERE active = true;

-- Log da operação crítica
INSERT INTO public.ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'ADMIN', 
    '🎯 FONTE ENCONTRADA: Desativados CRON JOBS que processavam campanhas WhatsApp a cada minuto e AI auto-setup',
    'system_cron_disabled',
    now()
);