-- Remove the incorrect trigger that's causing the agent_slug error
DROP TRIGGER IF EXISTS trg_sync_assistant_produtos ON public.produtos;

-- This trigger was incorrectly trying to access agent_slug field on produtos table
-- which doesn't have this field, causing the "agent_slug" field error when saving products