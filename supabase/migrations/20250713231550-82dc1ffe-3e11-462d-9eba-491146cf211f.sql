-- Criar pedido de teste para verificar envio WhatsApp real
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
    'Teste WhatsApp Real',
    '69992254080',
    75.50,
    'confirmado',
    'delivery',
    'pix'
);