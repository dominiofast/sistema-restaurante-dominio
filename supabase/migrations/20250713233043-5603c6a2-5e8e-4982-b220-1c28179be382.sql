-- Teste da função de notificação WhatsApp
INSERT INTO pedidos (
    company_id,
    nome,
    telefone,
    endereco,
    total,
    status,
    tipo,
    pagamento
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Teste Função Completa',
    '69992254080',
    'Rua Teste, 123 - Centro',
    89.90,
    'confirmado',
    'delivery',
    'pix'
);

-- Inserir itens do pedido para teste
INSERT INTO pedido_itens (
    pedido_id,
    nome_produto,
    quantidade,
    valor_unitario,
    valor_total,
    observacoes
) VALUES 
(LASTVAL(), 'Pizza Margherita G', 1, 45.00, 45.00, 'Massa fina'),
(LASTVAL(), 'Refrigerante 2L', 1, 12.00, 12.00, 'Coca-Cola'),
(LASTVAL(), 'Batata Frita', 1, 15.00, 15.00, 'Porção grande');

-- Inserir adicionais para teste
INSERT INTO pedido_item_adicionais (
    pedido_item_id,
    nome_adicional,
    categoria_nome,
    quantidade,
    valor_unitario,
    valor_total
) SELECT 
    pi.id,
    'Queijo Extra',
    'Adicionais',
    1,
    5.00,
    5.00
FROM pedido_itens pi 
WHERE pi.pedido_id = LASTVAL() AND pi.nome_produto = 'Pizza Margherita G';