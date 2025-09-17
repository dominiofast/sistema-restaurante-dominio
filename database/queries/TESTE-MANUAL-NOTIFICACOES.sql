-- TESTE MANUAL DAS NOTIFICAÇÕES
-- Execute uma consulta por vez no SQL Editor

-- 1. PRIMEIRO: Encontrar um pedido para testar
SELECT 
    'PEDIDOS DISPONÍVEIS' as info,
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    company_id,
    updated_at
FROM pedidos 
WHERE status = 'analise' 
AND telefone IS NOT NULL
AND nome IS NOT NULL
ORDER BY updated_at DESC
LIMIT 3;

-- 2. ESCOLHA UM ID DA CONSULTA ACIMA E SUBSTITUA NA LINHA ABAIXO:
-- Exemplo: UPDATE pedidos SET status = 'producao' WHERE id = 'SEU_ID_AQUI';

-- 3. APÓS EXECUTAR O UPDATE, VERIFIQUE OS LOGS:
SELECT 
    'LOGS APÓS UPDATE' as info,
    created_at,
    message_type,
    customer_phone,
    customer_name,
    LEFT(message_content, 100) as mensagem_resumo
FROM ai_conversation_logs 
WHERE created_at > NOW() - INTERVAL '5 minutes'
AND message_type LIKE '%production%'
ORDER BY created_at DESC;

-- 4. VERIFIQUE SE MENSAGEM FOI SALVA:
SELECT 
    'MENSAGENS NOTIFICAÇÃO' as info,
    message_id,
    contact_name,
    contact_phone,
    LEFT(message_content, 80) as mensagem,
    is_from_me,
    status,
    timestamp
FROM whatsapp_messages 
WHERE message_id LIKE 'notify_%'
AND timestamp > NOW() - INTERVAL '5 minutes'
ORDER BY timestamp DESC;
