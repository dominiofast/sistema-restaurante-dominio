
-- Atualizar todas as integrações WhatsApp existentes para usar o novo domínio
UPDATE whatsapp_integrations 
SET webhook = 'https://dominio.tech/api/webhook'
WHERE webhook IS NULL 
   OR webhook = 'https://lovable-erp-cloud-suite.lovable.app/' 
   OR webhook = 'https://dreamy-cocada-e54fab.netlify.app/'
   OR webhook = '';

-- Verificar as atualizações
SELECT id, company_id, instance_key, webhook 
FROM whatsapp_integrations;
