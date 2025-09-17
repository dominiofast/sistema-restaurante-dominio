-- TESTE DIRETO: criar um pedido de teste e atualizar status
INSERT INTO pedidos (
    company_id,
    nome,
    telefone,
    status,
    tipo,
    total,
    numero_pedido
) VALUES (
    'da80bf30-43eb-4ee9-941b-caca3bb08090',
    'TESTE TRIGGER',
    '5569999999999',
    'analise',
    'delivery',
    50.00,
    999
) ON CONFLICT DO NOTHING;

-- Agora atualizar para produção para testar o trigger
UPDATE pedidos 
SET status = 'producao', updated_at = NOW()
WHERE nome = 'TESTE TRIGGER' AND status = 'analise';

-- Verificar se os logs foram criados
SELECT 
    'Logs criados:' as info,
    COUNT(*) as total
FROM ai_conversation_logs 
WHERE customer_name = 'TESTE TRIGGER';

-- Listar os logs
SELECT 
    message_type,
    message_content,
    created_at
FROM ai_conversation_logs 
WHERE customer_name = 'TESTE TRIGGER'
ORDER BY created_at DESC;