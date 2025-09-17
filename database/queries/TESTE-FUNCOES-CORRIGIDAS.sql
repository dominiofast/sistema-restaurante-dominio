-- TESTAR FUNÇÕES CORRIGIDAS
-- Execute APÓS executar os 2 arquivos anteriores

-- 1. ENCONTRAR UM PEDIDO PARA TESTE
SELECT 
    'PEDIDO PARA TESTE' as info,
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    company_id
FROM pedidos 
WHERE status = 'analise'
AND telefone IS NOT NULL 
AND nome IS NOT NULL
ORDER BY updated_at DESC
LIMIT 3;

-- 2. ESCOLHER UM ID DA CONSULTA ACIMA E SUBSTITUIR ABAIXO
-- Exemplo: UPDATE pedidos SET status = 'producao' WHERE id = 'SEU_ID_AQUI';

-- 3. VERIFICAR LOGS APÓS O UPDATE
SELECT 
    'LOGS DETALHADOS' as info,
    created_at,
    message_type,
    customer_name,
    LEFT(message_content, 80) as resumo
FROM ai_conversation_logs 
WHERE created_at > NOW() - INTERVAL '2 minutes'
AND message_type IN (
    'production_whatsapp_sent',
    'production_message_saved',
    'production_save_error',
    'production_whatsapp_error'
)
ORDER BY created_at DESC;

-- 4. VERIFICAR SE MENSAGEM FOI SALVA
SELECT 
    'MENSAGEM SALVA NO CHAT' as info,
    message_id,
    contact_name,
    contact_phone,
    LEFT(message_content, 60) as mensagem,
    timestamp
FROM whatsapp_messages 
WHERE message_id LIKE 'notify_%'
AND timestamp > NOW() - INTERVAL '2 minutes'
ORDER BY timestamp DESC;

-- 5. VERIFICAR CHAT ATUALIZADO
SELECT 
    'CHAT ATUALIZADO' as info,
    contact_name,
    contact_phone,
    LEFT(last_message, 60) as ultima_mensagem,
    last_message_time
FROM whatsapp_chats 
WHERE last_message_time > NOW() - INTERVAL '2 minutes'
ORDER BY last_message_time DESC;
