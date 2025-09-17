-- Inserir itens fictícios para disparar o trigger nos pedidos 93 e 94
-- Isso vai fazer com que a notificação seja enviada

-- Para o pedido 93
INSERT INTO pedido_itens (
    pedido_id,
    nome_produto,
    quantidade,
    valor_unitario,
    valor_total
) VALUES (93, 'Notificação Trigger', 0, 0.00, 0.00);

-- Para o pedido 94  
INSERT INTO pedido_itens (
    pedido_id,
    nome_produto,
    quantidade,
    valor_unitario,
    valor_total
) VALUES (94, 'Notificação Trigger', 0, 0.00, 0.00);

-- Remover os itens fictícios após disparar o trigger
DELETE FROM pedido_itens WHERE nome_produto = 'Notificação Trigger';