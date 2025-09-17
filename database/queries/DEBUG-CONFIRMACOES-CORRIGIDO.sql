-- DEBUG CONFIRMACOES WHATSAPP CORRIGIDO
-- Verificar triggers e funcoes ativas

-- 1. VERIFICAR TRIGGERS ATIVOS
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'public' 
AND (c.relname = 'pedido_itens' OR c.relname = 'pedidos')
AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- 2. VERIFICAR FUNCOES EXISTENTES
SELECT 
    proname as function_name
FROM pg_proc 
WHERE proname LIKE '%whatsapp%' OR proname LIKE '%production%' OR proname LIKE '%notification%'
ORDER BY proname;

-- 3. TESTAR INTEGRACAO WHATSAPP ATIVA
SELECT 
    company_id,
    instance_key,
    is_active,
    created_at
FROM whatsapp_integrations 
WHERE is_active = true;

-- 4. VERIFICAR PEDIDO 12 ESPECIFICAMENTE
SELECT 
    p.id,
    p.numero_pedido,
    p.nome_cliente,
    p.telefone,
    p.status,
    p.company_id,
    p.created_at
FROM pedidos p 
WHERE numero_pedido = '12'
ORDER BY created_at DESC;

-- 5. VERIFICAR ITENS DO PEDIDO 12
SELECT 
    pi.id,
    pi.pedido_id,
    pi.produto_id,
    pi.quantidade,
    pi.created_at,
    p.name as produto_nome
FROM pedido_itens pi
JOIN produtos p ON pi.produto_id = p.id
WHERE pi.pedido_id = (SELECT id FROM pedidos WHERE numero_pedido = '12' ORDER BY created_at DESC LIMIT 1);

-- 6. TESTE SIMPLES
SELECT 'Debug executado com sucesso!' as status;
