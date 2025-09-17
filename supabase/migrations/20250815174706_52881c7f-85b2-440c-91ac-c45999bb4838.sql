-- Limpar assistant_id corrompido da Quadrata Pizzas para forçar recriação
UPDATE ai_agent_assistants 
SET assistant_id = NULL 
WHERE assistant_id = 'asst_OAYZPyfdUjlyTSBAH4p4a5aU';