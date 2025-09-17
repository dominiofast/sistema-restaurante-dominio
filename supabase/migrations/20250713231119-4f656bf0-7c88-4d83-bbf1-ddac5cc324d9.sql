-- Recriar o trigger para notificações automáticas
DROP TRIGGER IF EXISTS trigger_send_whatsapp_notification ON pedidos;

CREATE TRIGGER trigger_send_whatsapp_notification
    AFTER INSERT ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_order_notification();