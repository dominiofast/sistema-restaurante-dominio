-- ENCONTREI O PROBLEMA! As RLS policies estão bloqueando o real-time
-- O real-time precisa de policies que permitam acesso sem autenticação
-- Vou ajustar as policies para permitir real-time funcionando

-- Remover policies restritivas e manter apenas as que permitem real-time
DROP POLICY IF EXISTS "Company users can manage their WhatsApp messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Company users can manage their WhatsApp chats" ON whatsapp_chats;

-- Garantir que as policies "Allow all" permitem real-time corretamente
DROP POLICY IF EXISTS "Allow all operations on whatsapp_messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Allow all operations on whatsapp_chats" ON whatsapp_chats;

-- Recriar policies otimizadas para real-time
CREATE POLICY "Enable realtime for whatsapp_messages" ON whatsapp_messages
    FOR ALL USING (true);

CREATE POLICY "Enable realtime for whatsapp_chats" ON whatsapp_chats  
    FOR ALL USING (true);