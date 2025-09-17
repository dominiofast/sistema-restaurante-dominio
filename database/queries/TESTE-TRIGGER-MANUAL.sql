-- TESTE MANUAL DOS TRIGGERS - Execute passo a passo

-- PASSO 1: Encontrar um pedido específico para testar
SELECT 
    'PEDIDO PARA TESTE' as info,
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    company_id
FROM pedidos 
WHERE telefone IS NOT NULL 
AND nome IS NOT NULL
ORDER BY updated_at DESC
LIMIT 3;

-- PASSO 2: ANOTAR UM ID DA CONSULTA ACIMA
-- Substitua 'SEU_ID_AQUI' pelo ID real de um pedido

-- PASSO 3: PRIMEIRO, vamos simular uma mudança SEM trigger
-- Executar isso vai nos mostrar se pelo menos o UPDATE funciona:

-- SELECT 'ANTES DO UPDATE' as status, status FROM pedidos WHERE id = 'SEU_ID_AQUI';

-- PASSO 4: FAZER O UPDATE (SUBSTITUA O ID!)
-- UPDATE pedidos SET status = 'producao' WHERE id = 'SEU_ID_AQUI' AND status = 'analise';

-- PASSO 5: VERIFICAR SE MUDOU
-- SELECT 'APÓS UPDATE' as status, status FROM pedidos WHERE id = 'SEU_ID_AQUI';

-- PASSO 6: VERIFICAR SE TRIGGER FOI EXECUTADO (Execute após o UPDATE)
SELECT 
    'LOGS TRIGGER' as info,
    created_at,
    message_type,
    customer_phone,
    customer_name,
    message_content
FROM ai_conversation_logs 
WHERE created_at > NOW() - INTERVAL '2 minutes'
ORDER BY created_at DESC;

-- PASSO 7: VERIFICAR SE MENSAGEM FOI SALVA (Execute após o UPDATE)
SELECT 
    'MENSAGEM SALVA' as info,
    message_id,
    contact_name,
    contact_phone,
    message_content,
    timestamp
FROM whatsapp_messages 
WHERE timestamp > NOW() - INTERVAL '2 minutes'
AND message_id LIKE 'notify_%'
ORDER BY timestamp DESC;
