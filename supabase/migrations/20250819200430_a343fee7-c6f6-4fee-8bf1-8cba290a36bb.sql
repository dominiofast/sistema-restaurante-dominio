-- Corrigir status inválidos nos pedidos da Domínio Pizzas
UPDATE pedidos 
SET status = 'analise' 
WHERE status NOT IN ('analise', 'producao', 'pronto', 'entregue', 'cancelado') 
  AND company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar quais pedidos foram corrigidos
SELECT id, numero_pedido, status, nome, created_at 
FROM pedidos 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
  AND status IN ('analise', 'producao', 'pronto')
ORDER BY created_at DESC;