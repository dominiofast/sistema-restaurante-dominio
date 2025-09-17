-- 🧪 TESTAR SISTEMA DE NOTIFICAÇÃO DE CASHBACK
-- Execute este script para testar as notificações

-- ================================
-- PASSO 1: VERIFICAR FUNÇÕES CRIADAS
-- ================================

SELECT 
    '🔍 VERIFICANDO FUNÇÕES CRIADAS' as info;

-- Verificar se a função existe
SELECT 
    proname as funcao,
    prosrc as codigo_fonte
FROM pg_proc 
WHERE proname = 'send_cashback_notification';

-- ================================
-- PASSO 2: VERIFICAR TABELA DE NOTIFICAÇÕES
-- ================================

SELECT 
    '📋 VERIFICANDO TABELA DE NOTIFICAÇÕES' as info;

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cashback_notifications'
ORDER BY ordinal_position;

-- ================================
-- PASSO 3: VERIFICAR TRIGGER
-- ================================

SELECT 
    '⚡ VERIFICANDO TRIGGER AUTOMÁTICO' as info;

-- Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos'
AND trigger_name = 'trigger_auto_cashback_notification';

-- ================================
-- PASSO 4: TESTAR NOTIFICAÇÃO MANUAL
-- ================================

SELECT 
    '🧪 TESTANDO NOTIFICAÇÃO MANUAL' as info;

-- Buscar um pedido finalizado com cashback para testar
WITH pedido_teste AS (
    SELECT 
        p.id,
        p.numero_pedido,
        p.company_id,
        p.nome,
        p.telefone,
        p.total,
        p.status,
        ct.valor as cashback_value
    FROM pedidos p
    JOIN cashback_transactions ct ON ct.pedido_id = p.id
    WHERE 
        p.status IN ('entregue', 'finalizado')
        AND ct.tipo = 'credito'
        AND DATE(p.created_at) = CURRENT_DATE
    LIMIT 1
)
SELECT 
    '📋 PEDIDO PARA TESTE:' as info,
    id,
    numero_pedido,
    nome as cliente,
    telefone,
    total,
    status,
    cashback_value
FROM pedido_teste;

-- ================================
-- PASSO 5: EXECUTAR TESTE
-- ================================

-- Se encontrou um pedido, testar a notificação
DO $$
DECLARE
    pedido_teste_id INTEGER;
    resultado JSONB;
BEGIN
    -- Buscar ID do pedido de teste
    SELECT p.id INTO pedido_teste_id
    FROM pedidos p
    JOIN cashback_transactions ct ON ct.pedido_id = p.id
    WHERE 
        p.status IN ('entregue', 'finalizado')
        AND ct.tipo = 'credito'
        AND DATE(p.created_at) = CURRENT_DATE
    LIMIT 1;
    
    IF pedido_teste_id IS NOT NULL THEN
        -- Testar notificação
        SELECT send_cashback_notification(pedido_teste_id) INTO resultado;
        
        RAISE NOTICE '🧪 TESTE EXECUTADO:';
        RAISE NOTICE '   Pedido ID: %', pedido_teste_id;
        RAISE NOTICE '   Resultado: %', resultado;
        
        IF resultado->>'success' = 'true' THEN
            RAISE NOTICE '✅ TESTE SUCESSO!';
        ELSE
            RAISE NOTICE '❌ TESTE FALHOU: %', resultado->>'error';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Nenhum pedido encontrado para teste';
    END IF;
END $$;

-- ================================
-- PASSO 6: VERIFICAR NOTIFICAÇÕES ENVIADAS
-- ================================

SELECT 
    '📊 NOTIFICAÇÕES ENVIADAS HOJE' as info;

-- Verificar notificações enviadas hoje
SELECT 
    cn.customer_name,
    cn.customer_phone,
    cn.pedido_id,
    cn.cashback_value,
    cn.notification_type,
    cn.status,
    cn.created_at
FROM cashback_notifications cn
WHERE DATE(cn.created_at) = CURRENT_DATE
ORDER BY cn.created_at DESC;

-- ================================
-- PASSO 7: VERIFICAR LOGS
-- ================================

SELECT 
    '📝 LOGS DE NOTIFICAÇÃO' as info;

-- Verificar logs de notificação
SELECT 
    acl.customer_name,
    acl.customer_phone,
    acl.message_type,
    acl.created_at,
    LEFT(acl.message_content, 100) as mensagem_resumida
FROM ai_conversation_logs acl
WHERE 
    acl.message_type = 'cashback_notification'
    AND DATE(acl.created_at) = CURRENT_DATE
ORDER BY acl.created_at DESC;

-- ================================
-- MENSAGEM DE CONCLUSÃO
-- ================================

SELECT 
    '🎯 TESTE CONCLUÍDO!' as resultado,
    'Verifique os resultados acima para confirmar o funcionamento' as instrucao,
    NOW() as data_teste;
