-- Trigger manual da notificação para os pedidos 93 e 94
DO $$
DECLARE
    item_record RECORD;
BEGIN
    -- Para cada item dos pedidos 93 e 94, simular o trigger
    FOR item_record IN 
        SELECT * FROM pedido_itens 
        WHERE pedido_id IN (93, 94)
        LIMIT 1 -- Só precisa executar uma vez por pedido
    LOOP
        -- Executar a função manualmente
        PERFORM send_whatsapp_notification_after_items() FROM (
            SELECT item_record.id, item_record.pedido_id, item_record.nome_produto, 
                   item_record.quantidade, item_record.valor_unitario, item_record.valor_total, 
                   item_record.observacoes, item_record.produto_id, item_record.created_at
        ) AS t(id, pedido_id, nome_produto, quantidade, valor_unitario, valor_total, observacoes, produto_id, created_at);
    END LOOP;
END $$;