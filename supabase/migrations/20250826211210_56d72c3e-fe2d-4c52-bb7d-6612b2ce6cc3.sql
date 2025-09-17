-- Corrigir webhooks para endpoints únicos baseados no instance_key
UPDATE whatsapp_integrations 
SET webhook = 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook/' || instance_key
WHERE purpose = 'primary';