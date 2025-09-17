UPDATE ai_agent_assistants 
SET use_direct_mode = true, updated_at = now() 
WHERE company_id = (SELECT id FROM companies WHERE slug = 'dominiopizzas');