-- TESTE FORÇADO DE NOTIFICAÇÃO
-- Execute passo a passo

-- PASSO 1: Ver pedidos disponíveis para teste
SELECT 
    'PEDIDOS PARA TESTE' as info,
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    company_id,
    updated_at
FROM pedidos 
WHERE telefone IS NOT NULL 
AND nome IS NOT NULL
AND status IN ('analise', 'producao')
ORDER BY updated_at DESC
LIMIT 3;

-- PASSO 2: ESCOLHA UM ID DA CONSULTA ACIMA E SUBSTITUA NAS LINHAS ABAIXO
-- Substitua 'SEU_ID_AQUI' por um ID real de um pedido em 'analise'

-- ANTES DO TESTE - Ver logs atuais
SELECT COUNT(*) as logs_antes FROM ai_conversation_logs 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- ANTES DO TESTE - Ver mensagens atuais
SELECT COUNT(*) as mensagens_antes FROM whatsapp_messages 
WHERE timestamp > NOW() - INTERVAL '1 hour';

-- EXECUTAR O UPDATE (SUBSTITUA O ID!)
-- UPDATE pedidos SET status = 'producao' WHERE id = 'SEU_ID_AQUI' AND status = 'analise';

-- VERIFICAR SE TRIGGER FOI EXECUTADO - Execute APÓS o UPDATE
SELECT 
    'LOGS APÓS UPDATE' as info,
    created_at,
    message_type,
    customer_phone,
    customer_name,
    LEFT(message_content, 100) as resumo
FROM ai_conversation_logs 
WHERE created_at > NOW() - INTERVAL '5 minutes'
AND message_type LIKE '%production%'
ORDER BY created_at DESC;

-- VERIFICAR SE MENSAGEM FOI SALVA - Execute APÓS o UPDATE
SELECT 
    'MENSAGEM SALVA' as info,
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
