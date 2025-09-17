-- Pausar seu número em TODAS as empresas que compartilham instance_key
UPDATE whatsapp_chats 
SET ai_paused = true 
WHERE contact_phone = '556992254080@s.whatsapp.net'
AND company_id IN (
  SELECT DISTINCT company_id 
  FROM whatsapp_integrations 
  WHERE instance_key IN ('megacode-MSjGIvEZJFk', 'megacode-MDT3OHEGIyu')
);