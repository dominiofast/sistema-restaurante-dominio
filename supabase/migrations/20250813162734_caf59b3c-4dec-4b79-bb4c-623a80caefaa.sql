-- Criar prompt padrão para cookielab baseado no template da quadratapizzas
INSERT INTO public.ai_agent_prompts (agent_slug, template, vars, version, owner_id)
SELECT 
  'cookielab' as agent_slug,
  template,
  jsonb_build_object(
    'agent_name', 'Atendente Virtual Cookielab',
    'cardapio_url', 'https://pedido.dominio.tech/cookielab',
    'company_name', 'Cookielab',
    'customer_name', '{{customer_name}}',
    'working_hours', 'das 08:00 as 22:00 horas',
    'company_address', 'Endereço da Cookielab'
  ) as vars,
  1 as version,
  owner_id
FROM public.ai_agent_prompts 
WHERE agent_slug = 'quadratapizzas'
LIMIT 1
ON CONFLICT (agent_slug) DO UPDATE SET
  template = EXCLUDED.template,
  vars = EXCLUDED.vars,
  version = EXCLUDED.version + 1,
  updated_at = now();