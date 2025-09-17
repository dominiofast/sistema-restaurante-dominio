-- Atualizar a função de limpeza automática das sequências antigas
-- para ser executada automaticamente

-- Função para limpar sequências antigas (mais de 30 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_pedido_sequences()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    seq_record RECORD;
    cutoff_date DATE;
    seq_date_str TEXT;
    seq_date DATE;
BEGIN
    -- Data de corte (30 dias atrás)
    cutoff_date := CURRENT_DATE - INTERVAL '30 days';
    
    -- Buscar todas as sequências de pedidos
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE sequencename LIKE 'pedidos_%_seq'
        AND sequencename ~ '\d{4}_\d{2}_\d{2}_seq$'
    LOOP
        BEGIN
            -- Extrair YYYY_MM_DD do nome da sequência
            seq_date_str := substring(seq_record.sequencename from '\d{4}_\d{2}_\d{2}');
            
            -- Converter para data
            seq_date := to_date(seq_date_str, 'YYYY_MM_DD');
            
            -- Se a sequência é mais antiga que 30 dias, remover
            IF seq_date < cutoff_date THEN
                EXECUTE format('DROP SEQUENCE IF EXISTS %I.%I', 
                    seq_record.schemaname, seq_record.sequencename);
                RAISE NOTICE 'Removida sequência antiga: %', seq_record.sequencename;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- Ignorar erros de parsing de data ou outras falhas
                CONTINUE;
        END;
    END LOOP;
    
    RAISE NOTICE 'Limpeza de sequências antigas concluída';
END;
$$;

-- Garantir que a função de limpeza pode ser executada
GRANT EXECUTE ON FUNCTION public.cleanup_old_pedido_sequences() TO authenticated;