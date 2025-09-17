-- Verificar como os adicionais estão salvos no pedido mais recente
SELECT 
    pi.nome_produto,
    pia.categoria_nome,
    pia.nome_adicional,
    pia.quantidade,
    pia.valor_unitario,
    pia.valor_total
FROM pedido_itens pi
LEFT JOIN pedido_item_adicionais pia ON pi.id = pia.pedido_item_id
WHERE pi.pedido_id = 188  -- Pedido mais recente
ORDER BY pi.id, pia.id;