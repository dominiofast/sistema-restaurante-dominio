-- Teste final com endpoint corrigido
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
    'Teste Endpoint Correto',
    '69992254080',
    120.00,
    'confirmado',
    'delivery',
    'pix'
);