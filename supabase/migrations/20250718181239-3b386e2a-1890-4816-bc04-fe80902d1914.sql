-- Remover trigger que está causando erro de schema "net"
DROP TRIGGER IF EXISTS trigger_auto_print_pedido ON public.pedidos;

-- Remover trigger de notificação WhatsApp que também pode usar net
DROP TRIGGER IF EXISTS trigger_send_whatsapp_ready_notification ON public.pedidos;