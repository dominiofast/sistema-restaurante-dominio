-- 📊 SCRIPT DE MONITORAMENTO DO SISTEMA DE NOTIFICAÇÕES WHATSAPP
-- Use este script para monitorar o funcionamento e diagnosticar problemas

-- ============================================================================
-- DASHBOARD GERAL
-- ============================================================================

SELECT '📊 DASHBOARD DE NOTIFICAÇÕES WHATSAPP' as titulo;
SELECT '═══════════════════════════════════════' as separador;

-- Status geral do sistema
SELECT 'STATUS DO SISTEMA:' as secao;

-- Verificar se o trigger está ativo
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_whatsapp_notification' 
            AND event_object_table = 'pedido_itens'
        ) 
        THEN '✅ Trigger ativo'
        ELSE '❌ Trigger inativo'
    END as status_trigger;

-- Verificar se as tabelas existem
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_queue') 
        THEN '✅ Queue table existe'
        ELSE '❌ Queue table não existe'
    END as status_queue_table;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs') 
        THEN '✅ Logs table existe'
        ELSE '❌ Logs table não existe'
    END as status_logs_table;

-- ============================================================================
-- ESTATÍSTICAS GERAIS
-- ============================================================================

SELECT '📈 ESTATÍSTICAS GERAIS (ÚLTIMAS 24H):' as secao;

-- Total de notificações por status
SELECT 
    status,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM notification_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY status
ORDER BY total DESC;

-- Notificações por tipo
SELECT 
    type,
    COUNT(*) as total
FROM notification_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY type
ORDER BY total DESC;

-- ============================================================================
-- QUEUE STATUS
-- ============================================================================

SELECT '📋 STATUS DA QUEUE:' as secao;

-- Itens na queue por status
SELECT 
    status,
    COUNT(*) as total,
    MIN(created_at) as mais_antigo,
    MAX(created_at) as mais_recente
FROM notification_queue 
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'failed' THEN 1
        WHEN 'retry' THEN 2
        WHEN 'pending' THEN 3
        WHEN 'processing' THEN 4
        WHEN 'sent' THEN 5
    END;

-- Itens com muitas tentativas
SELECT 
    'ITENS COM MUITAS TENTATIVAS:' as alerta;

SELECT 
    pedido_id,
    retry_count,
    max_retries,
    status,
    next_retry_at,
    created_at,
    payload->>'error' as ultimo_erro
FROM notification_queue 
WHERE retry_count >= 2
ORDER BY retry_count DESC, created_at ASC
LIMIT 10;

-- ============================================================================
-- LOGS RECENTES
-- ============================================================================

SELECT '📝 LOGS RECENTES (ÚLTIMAS 10):' as secao;

SELECT 
    created_at,
    pedido_id,
    type,
    status,
    details->>'phone' as telefone,
    details->>'error' as erro,
    CASE 
        WHEN details->>'sent' = 'true' THEN '✅'
        WHEN details->>'sent' = 'false' THEN '❌'
        ELSE '❓'
    END as enviado
FROM notification_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================================================
-- ANÁLISE DE ERROS
-- ============================================================================

SELECT '🚨 ANÁLISE DE ERROS (ÚLTIMAS 24H):' as secao;

-- Tipos de erro mais comuns
SELECT 
    details->>'error' as tipo_erro,
    COUNT(*) as ocorrencias,
    MAX(created_at) as ultima_ocorrencia
FROM notification_logs 
WHERE status = 'failed' 
AND created_at >= NOW() - INTERVAL '24 hours'
AND details->>'error' IS NOT NULL
GROUP BY details->>'error'
ORDER BY ocorrencias DESC
LIMIT 10;

-- ============================================================================
-- PERFORMANCE
-- ============================================================================

SELECT '⚡ ANÁLISE DE PERFORMANCE:' as secao;

-- Notificações por hora nas últimas 24h
SELECT 
    DATE_TRUNC('hour', created_at) as hora,
    COUNT(*) as total_notificacoes,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as sucessos,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as falhas,
    ROUND(
        COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as taxa_sucesso_pct
FROM notification_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hora DESC
LIMIT 24;

-- ============================================================================
-- INTEGRAÇÕES WHATSAPP
-- ============================================================================

SELECT '📱 STATUS DAS INTEGRAÇÕES WHATSAPP:' as secao;

-- Integrações ativas por empresa
SELECT 
    c.name as empresa,
    wi.instance_key,
    wi.active as ativa,
    wi.created_at as criada_em,
    COUNT(nl.id) as notificacoes_24h
FROM companies c
LEFT JOIN whatsapp_integrations wi ON wi.company_id = c.id
LEFT JOIN notification_logs nl ON nl.details->>'company_id' = c.id::text 
    AND nl.created_at >= NOW() - INTERVAL '24 hours'
WHERE wi.id IS NOT NULL
GROUP BY c.name, wi.instance_key, wi.active, wi.created_at
ORDER BY notificacoes_24h DESC;

-- ============================================================================
-- PEDIDOS RECENTES SEM NOTIFICAÇÃO
-- ============================================================================

SELECT '⚠️ PEDIDOS RECENTES SEM NOTIFICAÇÃO:' as secao;

-- Pedidos das últimas 2 horas que não têm log de notificação
SELECT 
    p.id,
    p.numero_pedido,
    p.nome,
    p.telefone,
    p.created_at,
    c.name as empresa,
    CASE 
        WHEN wi.id IS NOT NULL THEN '✅ Tem integração'
        ELSE '❌ Sem integração'
    END as status_integracao
FROM pedidos p
JOIN companies c ON p.company_id = c.id
LEFT JOIN whatsapp_integrations wi ON wi.company_id = c.id AND wi.active = true
LEFT JOIN notification_logs nl ON nl.pedido_id = p.id
WHERE p.created_at >= NOW() - INTERVAL '2 hours'
AND nl.id IS NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================================================
-- COMANDOS ÚTEIS
-- ============================================================================

SELECT '🛠️ COMANDOS ÚTEIS:' as secao;
SELECT '• Limpar logs antigos: SELECT cleanup_old_notification_logs();' as comando_1;
SELECT '• Reprocessar queue: UPDATE notification_queue SET status = ''pending'' WHERE status = ''failed'';' as comando_2;
SELECT '• Ver trigger ativo: SELECT * FROM information_schema.triggers WHERE trigger_name LIKE ''%whatsapp%'';' as comando_3;
SELECT '• Logs em tempo real: SELECT * FROM notification_logs WHERE created_at >= NOW() - INTERVAL ''5 minutes'';' as comando_4;

-- ============================================================================
-- ALERTAS
-- ============================================================================

SELECT '🚨 ALERTAS AUTOMÁTICOS:' as secao;

-- Alerta: muitas falhas recentes
DO $$
DECLARE
    falhas_recentes INTEGER;
BEGIN
    SELECT COUNT(*) INTO falhas_recentes
    FROM notification_logs 
    WHERE status = 'failed' 
    AND created_at >= NOW() - INTERVAL '1 hour';
    
    IF falhas_recentes > 5 THEN
        RAISE WARNING 'ALERTA: % falhas de notificação na última hora!', falhas_recentes;
    END IF;
END $$;

-- Alerta: queue muito cheia
DO $$
DECLARE
    itens_pendentes INTEGER;
BEGIN
    SELECT COUNT(*) INTO itens_pendentes
    FROM notification_queue 
    WHERE status IN ('pending', 'retry');
    
    IF itens_pendentes > 10 THEN
        RAISE WARNING 'ALERTA: % itens pendentes na queue!', itens_pendentes;
    END IF;
END $$;

SELECT '✅ Monitoramento concluído!' as resultado;