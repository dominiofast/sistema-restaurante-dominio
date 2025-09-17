-- 🔍 DIAGNÓSTICO SIMPLES - DESCOBRIR ESTRUTURA E PROBLEMA
-- Execute este script para descobrir o que aconteceu

SELECT '🔍 DIAGNÓSTICO RÁPIDO' as titulo;

-- 1. VERIFICAR SE O TRIGGER EXISTE
SELECT '1️⃣ VERIFICAR TRIGGER:' as secao;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_whatsapp_notification' 
            AND event_object_table = 'pedido_itens'
        ) 
        THEN '✅ Trigger instalado'
        ELSE '❌ TRIGGER NÃO INSTALADO'
    END as status_trigger;

-- 2. PEDIDO MAIS RECENTE
SELECT '2️⃣ SEU PEDIDO TESTE:' as secao;

SELECT 
    id,
    numero_pedido,
    nome,
    telefone,
    company_id,
    total,
    created_at
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 1;

-- 3. DESCOBRIR ESTRUTURA DA TABELA WHATSAPP_INTEGRATIONS
SELECT '3️⃣ ESTRUTURA DA TABELA WHATSAPP:' as secao;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'whatsapp_integrations'
ORDER BY ordinal_position;

-- 4. VER INTEGRAÇÕES WHATSAPP (SEM USAR COLUNA ACTIVE)
SELECT '4️⃣ INTEGRAÇÕES WHATSAPP:' as secao;

SELECT 
    wi.*,
    c.name as nome_empresa
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
WHERE wi.company_id = (
    SELECT company_id FROM pedidos ORDER BY created_at DESC LIMIT 1
)
ORDER BY wi.created_at DESC;

-- 5. VERIFICAR SE EXISTEM TABELAS DE LOG
SELECT '5️⃣ VERIFICAR TABELAS DE SUPORTE:' as secao;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs') 
        THEN '✅ notification_logs existe'
        ELSE '❌ notification_logs NÃO EXISTE'
    END as tabela_logs;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_queue') 
        THEN '✅ notification_queue existe'
        ELSE '❌ notification_queue NÃO EXISTE'
    END as tabela_queue;

-- 6. VERIFICAR TODOS OS TRIGGERS NA TABELA PEDIDO_ITENS
SELECT '6️⃣ TODOS OS TRIGGERS:' as secao;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'pedido_itens'
ORDER BY trigger_name;

-- 7. DIAGNÓSTICO BÁSICO
SELECT '7️⃣ DIAGNÓSTICO:' as secao;

SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_whatsapp_notification'
        ) 
        THEN '❌ PROBLEMA: Sistema não foi instalado! Execute install-whatsapp-notifications.sql'
        
        WHEN NOT EXISTS (
            SELECT 1 FROM whatsapp_integrations wi
            WHERE wi.company_id = (SELECT company_id FROM pedidos ORDER BY created_at DESC LIMIT 1)
        )
        THEN '❌ PROBLEMA: Não há integração WhatsApp para esta empresa!'
        
        ELSE '✅ Componentes básicos parecem OK - precisa investigar mais'
    END as diagnostico_inicial;