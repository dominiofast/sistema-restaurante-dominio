-- Testar a função novamente com dados mais realísticos
SELECT public.criar_pedido_pdv_completo(
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Cliente Teste',
    '69999999999',
    '[{"produto_id":"8024a5c2-f5c8-4a53-be55-232c582c25bf","nome_produto":"Pizza Teste","quantidade":1,"preco_unitario":25.50,"adicionais":[]}]',
    'Rua Teste, 123',
    'delivery',
    'dinheiro',
    25.50,
    'Observação teste'
);