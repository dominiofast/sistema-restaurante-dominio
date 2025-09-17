-- Criar tabela para configuração de notificações de pedidos via WhatsApp
CREATE TABLE public.whatsapp_order_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  send_confirmation boolean NOT NULL DEFAULT true,
  send_status_updates boolean NOT NULL DEFAULT true,
  send_delivery_updates boolean NOT NULL DEFAULT true,
  confirmation_template text DEFAULT 'Seu pedido #{order_number} foi confirmado! Total: R$ {total}. Tempo estimado: {estimated_time} minutos.',
  status_update_template text DEFAULT 'Seu pedido #{order_number} foi atualizado para: {status}',
  delivery_template text DEFAULT 'Seu pedido #{order_number} está a caminho! Acompanhe a entrega.',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_order_notifications ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their company order notifications" 
ON public.whatsapp_order_notifications 
FOR SELECT 
USING (
  company_id IN (
    SELECT c.id FROM companies c 
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
    WHERE u.id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
  )
);

CREATE POLICY "Users can insert their company order notifications" 
ON public.whatsapp_order_notifications 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT c.id FROM companies c 
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
    WHERE u.id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
  )
);

CREATE POLICY "Users can update their company order notifications" 
ON public.whatsapp_order_notifications 
FOR UPDATE 
USING (
  company_id IN (
    SELECT c.id FROM companies c 
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
    WHERE u.id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
  )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_whatsapp_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_notifications_updated_at
BEFORE UPDATE ON public.whatsapp_order_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_whatsapp_notifications_updated_at();

-- Adicionar foreign key constraint
ALTER TABLE public.whatsapp_order_notifications 
ADD CONSTRAINT whatsapp_order_notifications_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;