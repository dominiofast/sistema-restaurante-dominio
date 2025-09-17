-- Verificar os pedidos mais recentes para ver se funcionou
SELECT id, numero_pedido, nome, telefone, origem, created_at, status, total
FROM public.pedidos 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY id DESC
LIMIT 8;