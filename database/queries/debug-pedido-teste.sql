-- 🔍 DIAGNÓSTICO DO PEDIDO TESTE QUE NÃO ENVIOU WHATSAPP
-- Execute este script para descobrir o que aconteceu

SELECT '🔍 DIAGNÓSTICO DO PROBLEMA' as titulo;
SELECT '═══════════════════════════════════' as separador;

-- 1. VERIFICAR SE O SISTEMA FOI INSTALADO
SELECT '1️⃣ VERIFICANDO INSTALAÇÃO DO SISTEMA:' as secao;

-- Verificar se o trigger existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_whatsapp_notification' 
            AND event_object_table = 'pedido_itens'
        ) 
        THEN '✅ Trigger instalado'
        ELSE '❌ TRIGGER NÃO INSTALADO - Execute install-whatsapp-notifications.sql'
    END as status_trigger;

-- Verificar se as tabelas existem
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs') 
        THEN '✅ Tabela notification_logs existe'
        ELSE '❌ TABELA notification_logs NÃO EXISTE - Execute install-whatsapp-notifications.sql'
    END as status_logs_table;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_queue') 
        THEN '✅ Tabela notification_queue existe'
        ELSE '❌ TABELA notification_queue NÃO EXISTE - Execute install-whatsapp-notifications.sql'
    END as status_queue_table;

-- 2. BUSCAR O PEDIDO MAIS RECENTE (PROVAVELMENTE O SEU TESTE)
SELECT '2️⃣ PEDIDO MAIS RECENTE (SEU TESTE):' as secao;

SELECT 
    id,
    numero_pedido,
    nome,
    telefone,
    company_id,
    total,
    created_at,
    '👆 Este é provavelmente seu pedido teste' as observacao
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 1;

-- 3. VERIFICAR SE EXISTEM ITENS PARA ESTE PEDIDO
SELECT '3️⃣ ITENS DO PEDIDO TESTE:' as secao;

SELECT 
    pi.id,
    pi.pedido_id,
    pi.produto_id,
    pi.nome_produto,
    pi.quantidade,
    pi.valor_total,
    pi.created_at,
    '👆 Estes itens deveriam ter disparado o trigger' as observacao
FROM pedido_itens pi
WHERE pi.pedido_id = (SELECT id FROM pedidos ORDER BY created_at DESC LIMIT 1)
ORDER BY pi.created_at;

-- 4. VERIFICAR SE HÁ LOGS PARA ESTE PEDIDO
SELECT '4️⃣ LOGS DE NOTIFICAÇÃO PARA ESTE PEDIDO:' as secao;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs') 
        THEN 'Verificando logs...'
        ELSE 'TABELA DE LOGS NÃO EXISTE - Sistema não foi instalado!'
    END as status_verificacao;

-- Se a tabela existe, mostrar os logs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs') THEN
        RAISE NOTICE 'Verificando logs do pedido mais recente...';
    END IF;
END $$;

-- Mostrar logs se existirem
SELECT 
    nl.created_at,
    nl.pedido_id,
    nl.type,
    nl.status,
    nl.details->>'phone' as telefone,
    nl.details->>'error' as erro,
    nl.details->>'trigger_executed' as trigger_executou,
    nl.details->>'sent' as foi_enviado
FROM notification_logs nl
WHERE nl.pedido_id = (SELECT id FROM pedidos ORDER BY created_at DESC LIMIT 1)
ORDER BY nl.created_at DESC;

-- 5. VERIFICAR SE HÁ ITENS NA QUEUE
SELECT '5️⃣ ITENS NA QUEUE PARA ESTE PEDIDO:' as secao;

SELECT 
    nq.created_at,
    nq.pedido_id,
    nq.type,
    nq.status,
    nq.retry_count,
    nq.payload->>'phone' as telefone,
    nq.payload->>'error' as erro,
    nq.payload->>'trigger_failed' as trigger_falhou
FROM notification_queue nq
WHERE nq.pedido_id = (SELECT id FROM pedidos ORDER BY created_at DESC LIMIT 1)
ORDER BY nq.created_at DESC;

-- 6. VERIFICAR INTEGRAÇÃO WHATSAPP DA EMPRESA
SELECT '6️⃣ INTEGRAÇÃO WHATSAPP DA EMPRESA:' as secao;

SELECT 
    wi.company_id,
    wi.instance_key,
    wi.active,
    wi.token IS NOT NULL as tem_token,
    wi.created_at,
    c.name as nome_empresa
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
WHERE wi.company_id = (
    SELECT company_id FROM pedidos ORDER BY created_at DESC LIMIT 1
)
ORDER BY wi.created_at DESC;

-- 7. VERIFICAR TRIGGERS ATIVOS NA TABELA PEDIDO_ITENS
SELECT '7️⃣ TRIGGERS ATIVOS NA TABELA PEDIDO_ITENS:' as secao;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    'Trigger encontrado' as status
FROM information_schema.triggers 
WHERE event_object_table = 'pedido_itens'
ORDER BY trigger_name;

-- 8. VERIFICAR SE A FUNÇÃO EXISTE
SELECT '8️⃣ FUNÇÃO DE TRIGGER:' as secao;

SELECT 
    routine_name,
    routine_type,
    'Função encontrada' as status
FROM information_schema.routines 
WHERE routine_name = 'send_whatsapp_notification_after_items';

-- 9. DIAGNÓSTICO FINAL
SELECT '9️⃣ DIAGNÓSTICO FINAL:' as secao;

DO $$
DECLARE
    tem_trigger BOOLEAN;
    tem_logs_table BOOLEAN;
    tem_queue_table BOOLEAN;
    tem_integracao BOOLEAN;
    pedido_recente_id UUID;
    tem_logs_pedido BOOLEAN;
BEGIN
    -- Verificar componentes
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_whatsapp_notification' 
        AND event_object_table = 'pedido_itens'
    ) INTO tem_trigger;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notification_logs'
    ) INTO tem_logs_table;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notification_queue'
    ) INTO tem_queue_table;
    
    -- Buscar pedido mais recente
    SELECT id INTO pedido_recente_id FROM pedidos ORDER BY created_at DESC LIMIT 1;
    
    -- Verificar se tem integração WhatsApp
    SELECT EXISTS (
        SELECT 1 FROM whatsapp_integrations wi
        WHERE wi.company_id = (SELECT company_id FROM pedidos WHERE id = pedido_recente_id)
        AND wi.active = true
    ) INTO tem_integracao;
    
    -- Verificar se tem logs para o pedido
    IF tem_logs_table THEN
        EXECUTE 'SELECT EXISTS (SELECT 1 FROM notification_logs WHERE pedido_id = $1)' 
        INTO tem_logs_pedido USING pedido_recente_id;
    ELSE
        tem_logs_pedido := false;
    END IF;
    
    -- Diagnóstico
    RAISE NOTICE '🔍 RESULTADO DO DIAGNÓSTICO:';
    
    IF NOT tem_trigger THEN
        RAISE NOTICE '❌ PROBLEMA: Trigger não está instalado!';
        RAISE NOTICE '💡 SOLUÇÃO: Execute o script install-whatsapp-notifications.sql';
    ELSIF NOT tem_logs_table OR NOT tem_queue_table THEN
        RAISE NOTICE '❌ PROBLEMA: Tabelas de suporte não existem!';
        RAISE NOTICE '💡 SOLUÇÃO: Execute o script install-whatsapp-notifications.sql';
    ELSIF NOT tem_integracao THEN
        RAISE NOTICE '❌ PROBLEMA: Não há integração WhatsApp ativa para esta empresa!';
        RAISE NOTICE '💡 SOLUÇÃO: Configure a integração WhatsApp no painel admin';
    ELSIF NOT tem_logs_pedido THEN
        RAISE NOTICE '❌ PROBLEMA: Trigger não executou para este pedido!';
        RAISE NOTICE '💡 SOLUÇÃO: Verifique se o trigger está realmente ativo';
    ELSE
        RAISE NOTICE '✅ Sistema parece estar configurado corretamente';
        RAISE NOTICE '🔍 Verifique os logs acima para detalhes do erro';
    END IF;
END $$;

SELECT '✅ Diagnóstico concluído! Verifique as mensagens acima.' as resultado;