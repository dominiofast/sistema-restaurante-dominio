-- INVESTIGAR TRIGGERS EXATOS E REMOVER DEFINITIVAMENTE

-- 1. LISTAR TODOS OS TRIGGERS COM NOMES EXATOS
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    'DROP TRIGGER IF EXISTS ' || t.tgname || ' ON ' || c.relname || ';' as comando_drop
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE (c.relname = 'pedido_itens' OR c.relname = 'pedidos')
AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;
