-- Configurar cookielab como delivery only
UPDATE public.ai_agent_prompts 
SET vars = jsonb_set(vars, '{delivery_only}', 'true'::jsonb),
    version = version + 1,
    updated_at = now()
WHERE agent_slug = 'cookielab';