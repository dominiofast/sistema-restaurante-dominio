-- Criar pedido de teste para verificar o trigger
INSERT INTO pedidos (
    company_id,
    nome,
    telefone,
    total,
    status,
    tipo,
    pagamento
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Teste Notificação',
    '69999999999',
    50.00,
    'confirmado',
    'delivery',
    'pix'
);