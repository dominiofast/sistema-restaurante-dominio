-- Criar função para resetar todas as sequências de pedidos diárias
CREATE OR REPLACE FUNCTION public.reset_all_daily_pedido_sequences()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    company_record RECORD;
    sequence_name TEXT;
    today_date TEXT;
BEGIN
    -- Data de hoje no formato YYYY-MM-DD
    today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
    
    -- Para cada empresa ativa, resetar sua sequência diária
    FOR company_record IN 
        SELECT id FROM companies WHERE status = 'active'
    LOOP
        -- Nome da sequência para hoje
        sequence_name := 'pedidos_' || replace(company_record.id::text, '-', '_') || '_' || today_date || '_seq';
        
        -- Resetar ou criar a sequência começando do 1
        BEGIN
            -- Tentar resetar se existe
            EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', sequence_name);
            RAISE NOTICE 'Sequência % resetada para 1', sequence_name;
        EXCEPTION
            WHEN undefined_table THEN
                -- Se não existe, será criada automaticamente quando necessário
                RAISE NOTICE 'Sequência % será criada quando necessário', sequence_name;
        END;
    END LOOP;
    
    RAISE NOTICE 'Reset diário de sequências de pedidos concluído para %', today_date;
END;
$function$;

-- Criar cron job para executar o reset todos os dias às 00:01
SELECT cron.schedule(
    'reset-daily-pedido-sequences',
    '1 0 * * *', -- Todos os dias às 00:01
    $$
    SELECT reset_all_daily_pedido_sequences();
    $$
);

-- Executar uma vez agora para testar
SELECT reset_all_daily_pedido_sequences();