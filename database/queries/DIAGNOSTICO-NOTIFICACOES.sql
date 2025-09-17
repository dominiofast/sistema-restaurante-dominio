-- DIAGNÓSTICO COMPLETO DAS NOTIFICAÇÕES WHATSAPP
-- Execute no SQL Editor do Supabase

-- 1. VERIFICAR TRIGGERS ATIVOS NA TABELA PEDIDOS
SELECT 
    'TRIGGERS ATIVOS' as secao,
    trigger_name,
    event_manipulation as evento,
    action_timing as timing,
    action_statement as funcao
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'pedidos'
ORDER BY trigger_name;

-- 2. VERIFICAR FUNÇÕES DE NOTIFICAÇÃO EXISTENTES
SELECT 
    'FUNCOES NOTIFICACAO' as secao,
    routine_name as nome_funcao,
    routine_type as tipo,
    created as data_criacao
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%notify_%'
OR routine_name LIKE '%whatsapp%'
ORDER BY routine_name;

-- 3. VERIFICAR INTEGRAÇÕES WHATSAPP ATIVAS
SELECT 
    'INTEGRACOES WHATSAPP' as secao,
    company_id,
    instance_name,
    instance_key,
    purpose,
    is_active,
    created_at
FROM whatsapp_integrations 
ORDER BY company_id, is_active DESC;

-- 4. VERIFICAR LOGS RECENTES DE NOTIFICAÇÕES (últimas 24h)
SELECT 
    'LOGS RECENTES' as secao,
    created_at,
    company_id,
    customer_phone,
    message_type,
    LEFT(message_content, 100) as mensagem_resumo
FROM ai_conversation_logs 
WHERE message_type IN (
    'production_notification_error',
    'production_status_change', 
    'ready_notification',
    'ready_status_change',
    'debug_production_trigger',
    'debug_ready_trigger',
    'notification_error'
)
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 20;

-- 5. VERIFICAR ÚLTIMOS PEDIDOS COM MUDANÇA DE STATUS
SELECT 
    'PEDIDOS RECENTES' as secao,
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    tipo,
    company_id,
    updated_at
FROM pedidos 
WHERE updated_at > NOW() - INTERVAL '24 hours'
AND status IN ('analise', 'producao', 'pronto', 'entregue')
ORDER BY updated_at DESC
LIMIT 10;

-- 6. VERIFICAR ESTRUTURA DA TABELA PEDIDOS (colunas importantes)
SELECT 
    'ESTRUTURA PEDIDOS' as secao,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
AND table_schema = 'public'
AND column_name IN ('status', 'nome', 'telefone', 'company_id', 'tipo', 'numero_pedido')
ORDER BY column_name;

-- 7. TESTAR SE HTTP EXTENSION ESTÁ ATIVA
SELECT 
    'EXTENSOES' as secao,
    extname as nome_extensao,
    extversion as versao
FROM pg_extension 
WHERE extname = 'http';
