-- DEBUG ESTRUTURA DAS TABELAS
-- Descobrir nomes reais das colunas antes de fazer queries

-- 1. ESTRUTURA TABELA PEDIDOS
SELECT 'TABELA: pedidos' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. ESTRUTURA TABELA PEDIDO_ITENS
SELECT 'TABELA: pedido_itens' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pedido_itens' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. ESTRUTURA TABELA WHATSAPP_INTEGRATIONS
SELECT 'TABELA: whatsapp_integrations' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'whatsapp_integrations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR SE TABELA WHATSAPP EXISTE
SELECT COUNT(*) as whatsapp_table_exists
FROM information_schema.tables 
WHERE table_name = 'whatsapp_integrations' 
AND table_schema = 'public';

-- 5. LISTAR TODAS AS TABELAS RELACIONADAS A WHATSAPP
SELECT table_name
FROM information_schema.tables 
WHERE table_name LIKE '%whatsapp%' 
AND table_schema = 'public';

-- 6. VERIFICAR TRIGGERS SIMPLES
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname IN ('pedido_itens', 'pedidos')
AND NOT t.tgisinternal;

-- 7. VERIFICAR FUNCOES
SELECT proname as function_name
FROM pg_proc 
WHERE proname LIKE '%whatsapp%' 
OR proname LIKE '%notification%';
