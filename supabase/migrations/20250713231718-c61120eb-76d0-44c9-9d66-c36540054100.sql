-- Teste final - criar pedido para verificar WhatsApp real
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
    'Teste Final WhatsApp',
    '69992254080',
    99.90,
    'confirmado',
    'delivery',
    'pix'
);