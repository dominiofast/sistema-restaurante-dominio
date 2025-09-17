-- 4. VERIFICAR PEDIDOS RECENTES
SELECT 
    'PEDIDOS RECENTES' as info,
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    updated_at
FROM pedidos 
WHERE telefone IS NOT NULL
AND nome IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;
