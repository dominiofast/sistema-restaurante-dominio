-- TESTE DAS NOTIFICAÇÕES WHATSAPP
-- Execute no SQL Editor do Supabase APÓS executar RECRIAR-NOTIFICACOES-WHATSAPP.sql

-- 1. LIMPAR LOGS DE TESTE ANTERIORES (OPCIONAL)
-- DELETE FROM ai_conversation_logs WHERE message_type LIKE '%test%';

-- 2. VERIFICAR SE HÁ PEDIDOS PARA TESTAR
SELECT 
    'PEDIDOS DISPONÍVEIS PARA TESTE' as info,
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    tipo,
    company_id
FROM pedidos 
WHERE status IN ('analise', 'producao')
AND telefone IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 3. VERIFICAR INTEGRAÇÃO WHATSAPP ATIVA
SELECT 
    'INTEGRAÇÃO WHATSAPP' as info,
    company_id,
    instance_name,
    instance_key,
    purpose,
    CASE WHEN api_key IS NOT NULL THEN 'API_KEY_OK' ELSE 'SEM_API_KEY' END as api_key_status
FROM whatsapp_integrations 
WHERE purpose = 'primary'
ORDER BY company_id;

-- 4. SIMULAR TESTE DE PRODUÇÃO
-- ESCOLHA UM ID DE PEDIDO DA PRIMEIRA CONSULTA E SUBSTITUA ABAIXO:

-- EXEMPLO: UPDATE pedidos SET status = 'producao' WHERE id = 'SEU_ID_AQUI' AND status = 'analise';

-- 5. SIMULAR TESTE DE PRONTO  
-- EXEMPLO: UPDATE pedidos SET status = 'pronto' WHERE id = 'SEU_ID_AQUI' AND status = 'producao';

-- 6. VERIFICAR LOGS APÓS O TESTE
-- Execute isso DEPOIS de fazer os UPDATEs acima:
SELECT 
    'LOGS DO TESTE' as info,
    created_at,
    message_type,
    customer_phone,
    customer_name,
    LEFT(message_content, 150) as mensagem_resumo
FROM ai_conversation_logs 
WHERE created_at > NOW() - INTERVAL '10 minutes'
AND message_type IN (
    'production_status_change',
    'production_notification_sent',
    'production_notification_error',
    'ready_status_change', 
    'ready_notification_sent',
    'ready_notification_error'
)
ORDER BY created_at DESC;

-- 7. CONTAR NOTIFICAÇÕES POR TIPO NAS ÚLTIMAS 24h
SELECT 
    'ESTATÍSTICAS 24H' as info,
    message_type,
    COUNT(*) as total
FROM ai_conversation_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
AND message_type IN (
    'production_status_change',
    'production_notification_sent',  
    'production_notification_error',
    'ready_status_change',
    'ready_notification_sent',
    'ready_notification_error'
)
GROUP BY message_type
ORDER BY message_type;
