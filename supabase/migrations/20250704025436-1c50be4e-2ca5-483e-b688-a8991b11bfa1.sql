-- Remover lógica de caixa e implementar numeração por dia

-- Primeiro, remover triggers e funções relacionadas a caixa
DROP TRIGGER IF EXISTS trigger_reset_pedido_sequence_on_caixa_open ON caixas;
DROP FUNCTION IF EXISTS trigger_reset_pedido_sequence();
DROP FUNCTION IF EXISTS reset_pedido_sequence_for_caixa(UUID);
DROP FUNCTION IF EXISTS get_next_pedido_number_for_caixa(UUID);

-- Criar função para obter próximo número do pedido por empresa por dia
CREATE OR REPLACE FUNCTION get_next_pedido_number_for_company_today(company_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    sequence_name TEXT;
    next_number INTEGER;
    today_date TEXT;
BEGIN
    -- Data de hoje no formato YYYY-MM-DD
    today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
    
    -- Nome da sequência específica para esta empresa hoje
    sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_' || today_date || '_seq';
    
    -- Verificar se a sequência existe, se não, criar
    BEGIN
        EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
    EXCEPTION 
        WHEN undefined_table THEN
            -- Criar a sequência se não existir
            EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
            EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
    END;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Criar função para limpar sequências antigas (mais de 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_pedido_sequences()
RETURNS VOID AS $$
DECLARE
    seq_record RECORD;
    cutoff_date DATE;
BEGIN
    -- Data de corte (30 dias atrás)
    cutoff_date := CURRENT_DATE - INTERVAL '30 days';
    
    -- Buscar todas as sequências de pedidos antigas
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE sequencename LIKE 'pedidos_%_seq'
        AND sequencename ~ '\d{4}_\d{2}_\d{2}_seq$'
    LOOP
        -- Extrair a data da sequência e verificar se é antiga
        DECLARE
            seq_date_str TEXT;
            seq_date DATE;
        BEGIN
            -- Extrair YYYY_MM_DD do nome da sequência
            seq_date_str := substring(seq_record.sequencename from '\d{4}_\d{2}_\d{2}');
            seq_date := to_date(seq_date_str, 'YYYY_MM_DD');
            
            -- Se a sequência é mais antiga que 30 dias, remover
            IF seq_date < cutoff_date THEN
                EXECUTE format('DROP SEQUENCE IF EXISTS %I.%I', seq_record.schemaname, seq_record.sequencename);
                RAISE NOTICE 'Removida sequência antiga: %', seq_record.sequencename;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- Ignorar erros de parsing de data
                CONTINUE;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Habilitar extensão pg_cron se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar limpeza automática das sequências antigas todo dia às 2h da manhã
SELECT cron.schedule(
    'cleanup-old-pedido-sequences',
    '0 2 * * *', -- todo dia às 2h da manhã
    'SELECT cleanup_old_pedido_sequences();'
);

-- Atualizar comentário da coluna para refletir a nova lógica
COMMENT ON COLUMN pedidos.numero_caixa IS 'Número sequencial do pedido por empresa por dia (reseta todo dia às 00:00)';