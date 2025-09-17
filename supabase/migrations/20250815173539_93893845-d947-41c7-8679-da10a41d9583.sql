-- Resetar assistant_id corrompido para forçar recriação
UPDATE ai_agent_assistants 
SET assistant_id = NULL 
WHERE company_id IN (
  SELECT id FROM companies WHERE slug = 'quadratapizzas'
);