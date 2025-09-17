-- Testar a função corrigida com dados de exemplo
SELECT public.criar_pedido_pdv_completo(
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Cliente Teste',
    '69999999999',
    '[{"produto_id":"182","nome_produto":"Pizza Teste","quantidade":1,"preco_unitario":25.50,"adicionais":[]}]',
    'Rua Teste, 123',
    'delivery',
    'dinheiro',
    25.50,
    'Observação teste'
);