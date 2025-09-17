UPDATE ai_agent_assistants 
SET use_direct_mode = true, updated_at = now() 
WHERE company_id IN (
    SELECT id FROM companies WHERE status = 'active'
);