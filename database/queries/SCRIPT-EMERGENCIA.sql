-- EXECUTE ESTE SQL EXATO (EMERGÊNCIA):

-- 1. DESABILITAR RLS NA TABELA PEDIDO_ITENS (RESOLVER ERRO 400)
ALTER TABLE pedido_itens DISABLE ROW LEVEL SECURITY;

-- 2. MATAR TODOS OS TRIGGERS (RESOLVER CONFIRMAÇÃO DUPLICADA)
DROP TRIGGER IF EXISTS trigger_whatsapp_notification_after_items ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_whatsapp_after_items ON pedido_itens CASCADE;
DROP TRIGGER IF EXISTS trigger_pedido_confirmacao_whatsapp ON pedidos CASCADE;

-- 3. MATAR FUNÇÃO QUE GERA MENSAGEM ANTIGA
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- 4. VERIFICAR SE LIMPOU
SELECT 'RESULTADO:' as status;
SELECT trigger_name, event_object_table FROM information_schema.triggers 
WHERE event_object_table IN ('pedidos', 'pedido_itens')
ORDER BY event_object_table, trigger_name;
