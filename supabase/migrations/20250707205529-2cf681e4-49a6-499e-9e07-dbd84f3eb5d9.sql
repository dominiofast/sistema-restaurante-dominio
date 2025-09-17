-- Remover tabela ifood_app_config (configuração será via secrets)
DROP TABLE IF EXISTS ifood_app_config CASCADE;

-- Simplificar tabela ifood_integrations para apenas configurações por loja
ALTER TABLE ifood_integrations 
DROP COLUMN IF EXISTS ifood_app_config_id;

-- Adicionar campos específicos da loja que não são credenciais globais
ALTER TABLE ifood_integrations 
ADD COLUMN IF NOT EXISTS environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

-- Atualizar comentários
COMMENT ON TABLE ifood_integrations IS 'Configurações específicas de cada loja iFood (sem credenciais globais)';
COMMENT ON COLUMN ifood_integrations.environment IS 'Ambiente da integração: sandbox ou production';
COMMENT ON COLUMN ifood_integrations.webhook_url IS 'URL do webhook para esta loja específica';
COMMENT ON COLUMN ifood_integrations.webhook_secret IS 'Secret para validação do webhook desta loja';