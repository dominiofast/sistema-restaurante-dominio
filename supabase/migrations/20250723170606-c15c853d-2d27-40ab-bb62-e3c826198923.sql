-- Limpar TODAS as sequências de pedidos existentes para hoje
DO $$
DECLARE
    seq_record RECORD;
    today_str TEXT;
BEGIN
    today_str := to_char(CURRENT_DATE, 'YYYY_MM_DD');
    
    -- Listar todas as sequências que contêm a data de hoje
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE sequencename LIKE '%' || today_str || '%'
        AND sequencename LIKE 'pedidos_%'
    LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I.%I CASCADE', seq_record.schemaname, seq_record.sequencename);
        RAISE NOTICE 'Sequência removida: %', seq_record.sequencename;
    END LOOP;
END $$;

-- Verificar se a função está funcionando agora
SELECT get_next_pedido_number_by_turno('1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91'::uuid) as primeiro_numero;