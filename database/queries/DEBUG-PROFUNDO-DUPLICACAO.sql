-- DEBUG PROFUNDO - ENCONTRAR CAUSA DA DUPLICACAO
-- Investigar TODOS os possíveis pontos de envio de WhatsApp

-- 1. VERIFICAR TODOS OS TRIGGERS EM TODAS AS TABELAS
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    p.proname as function_name,
    'TRIGGER ATIVO' as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'public'
AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- 2. PROCURAR TODAS AS FUNCOES QUE FAZEM HTTP CALLS
SELECT 
    proname as function_name,
    'FUNCAO COM HTTP' as tipo
FROM pg_proc 
WHERE prosrc LIKE '%http%' 
OR prosrc LIKE '%whatsapp%'
OR prosrc LIKE '%sendMessage%'
ORDER BY proname;

-- 3. VERIFICAR SE TEM ALGO NA TABELA WHATSAPP_ORDER_NOTIFICATIONS
SELECT COUNT(*) as total_notifications
FROM whatsapp_order_notifications;

-- 4. VERIFICAR ULTIMAS NOTIFICACOES ENVIADAS
SELECT *
FROM whatsapp_order_notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. DESATIVAR TEMPORARIAMENTE O TRIGGER PARA TESTAR
ALTER TABLE pedido_itens DISABLE TRIGGER trigger_whatsapp_unico_final;

SELECT 'TRIGGER DESATIVADO - TESTE UM PEDIDO AGORA!' as status;
