-- Remover políticas existentes e criar novas mais simples
DROP POLICY IF EXISTS "Users can view their company order notifications" ON whatsapp_order_notifications;
DROP POLICY IF EXISTS "Users can insert their company order notifications" ON whatsapp_order_notifications;
DROP POLICY IF EXISTS "Users can update their company order notifications" ON whatsapp_order_notifications;

-- Criar políticas RLS mais simples e funcionais
CREATE POLICY "Allow all authenticated users to view notifications" 
ON whatsapp_order_notifications 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to insert notifications" 
ON whatsapp_order_notifications 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update notifications" 
ON whatsapp_order_notifications 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to delete notifications" 
ON whatsapp_order_notifications 
FOR DELETE 
TO authenticated
USING (true);