-- Adicionar campo ia_paused na tabela whatsapp_integrations
-- Para controlar quando a IA está pausada para processamento automático de mensagens

ALTER TABLE whatsapp_integrations
ADD COLUMN IF NOT EXISTS ia_paused BOOLEAN DEFAULT false;

-- Comentário para documentação
COMMENT ON COLUMN whatsapp_integrations.ia_paused IS 'Indica se o processamento automático de mensagens pela IA está pausado';

-- Criar índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_ia_paused 
ON whatsapp_integrations(company_id, purpose, ia_paused)
WHERE ia_paused = false;
