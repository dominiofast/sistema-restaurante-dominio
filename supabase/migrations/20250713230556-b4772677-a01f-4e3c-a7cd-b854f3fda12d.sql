-- Inserir configuração padrão para a empresa Domínio Pizzas
INSERT INTO whatsapp_order_notifications (
  company_id,
  is_active,
  send_confirmation,
  send_status_updates,
  send_delivery_updates,
  confirmation_template,
  status_update_template,
  delivery_template
) 
SELECT 
  c.id,
  true,
  true,
  true,
  true,
  'Seu pedido #{order_number} foi confirmado! Total: R$ {total}. Tempo estimado: {estimated_time} minutos.',
  'Seu pedido #{order_number} foi atualizado para: {status}',
  'Seu pedido #{order_number} está a caminho! Acompanhe a entrega.'
FROM companies c 
WHERE c.name = 'Domínio Pizzas'
AND NOT EXISTS (
  SELECT 1 FROM whatsapp_order_notifications w 
  WHERE w.company_id = c.id
);