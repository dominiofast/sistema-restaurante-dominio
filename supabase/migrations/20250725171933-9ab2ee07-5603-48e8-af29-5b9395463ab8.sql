-- Atualizar webhook para usar a edge function
UPDATE whatsapp_integrations 
SET webhook = 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/agente-ia-conversa'
WHERE company_id = '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91';