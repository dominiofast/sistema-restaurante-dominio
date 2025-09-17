-- Criar função para limpar pedidos cancelados após 24 horas
CREATE OR REPLACE FUNCTION cleanup_canceled_orders()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Data de corte: 24 horas atrás
    cutoff_time := NOW() - INTERVAL '24 hours';
    
    -- Deletar pedidos cancelados há mais de 24 horas
    -- Primeiro deletar itens relacionados
    DELETE FROM public.pedido_itens 
    WHERE pedido_id IN (
        SELECT id FROM public.pedidos 
        WHERE status = 'cancelado' 
        AND updated_at < cutoff_time
    );
    
    -- Deletar adicionais relacionados aos itens
    DELETE FROM public.pedido_item_adicionais 
    WHERE pedido_item_id NOT IN (
        SELECT id FROM public.pedido_itens
    );
    
    -- Agora deletar os pedidos cancelados
    DELETE FROM public.pedidos 
    WHERE status = 'cancelado' 
    AND updated_at < cutoff_time;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log da limpeza
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
        'CLEANUP',
        'LIMPEZA AUTOMÁTICA: ' || deleted_count || ' pedidos cancelados há mais de 24h foram removidos',
        'system_cleanup',
        now()
    );
    
    RETURN 'Limpeza concluída: ' || deleted_count || ' pedidos cancelados removidos';
END;
$$;

-- Criar job cron para executar a limpeza a cada hora
SELECT cron.schedule(
    'cleanup-canceled-orders-hourly',
    '0 * * * *', -- A cada hora no minuto 0
    $$
    SELECT cleanup_canceled_orders();
    $$
);