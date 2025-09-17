-- Adicionar coluna para controlar modo direto por empresa
ALTER TABLE ai_agent_assistants 
ADD COLUMN use_direct_mode boolean DEFAULT false;

-- Comentário: Esta coluna permitirá migração gradual empresa por empresa
COMMENT ON COLUMN ai_agent_assistants.use_direct_mode IS 'Flag para habilitar Chat Completions direto ao invés de OpenAI Assistants';