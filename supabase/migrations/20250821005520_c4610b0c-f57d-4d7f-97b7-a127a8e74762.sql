-- Marcar seu número como pausado em TODAS as empresas para eliminar qualquer resposta
UPDATE whatsapp_chats 
SET ai_paused = true 
WHERE contact_phone = '556992254080@s.whatsapp.net';