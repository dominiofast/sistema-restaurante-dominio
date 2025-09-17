-- Verificar se existe algum trigger na tabela pedido_itens
SELECT trigger_name, trigger_schema, event_manipulation, action_timing, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'pedido_itens';

-- Remover qualquer trigger existente
DROP TRIGGER IF EXISTS trigger_whatsapp_notification_after_items ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_whatsapp_after_items ON pedido_itens;

-- Verificar se a função existe
SELECT proname FROM pg_proc WHERE proname = 'send_whatsapp_notification_after_items';

-- Recriar o trigger
CREATE TRIGGER trigger_whatsapp_notification_after_items
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- Verificar se o trigger foi criado
SELECT trigger_name, event_manipulation, action_timing 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_whatsapp_notification_after_items';