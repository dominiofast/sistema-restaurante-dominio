-- Teste final com formato de payload correto
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
    'Teste Payload Correto',
    '69992254080',
    150.00,
    'confirmado',
    'delivery',
    'pix'
);