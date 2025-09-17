-- Remover prompts customizados que estão causando problemas com variáveis não substituídas
-- Isso fará com que todas as empresas usem o template global que já foi corrigido
DELETE FROM ai_agent_prompts WHERE agent_slug IN ('300graus', 'quadratapizzas');