-- Standardize prompts to use company_slug and ensure cardapio_url

-- 1) Ensure vars contain company_slug and cardapio_url
UPDATE ai_agent_prompts ap
SET vars = COALESCE(ap.vars, '{}'::jsonb)
         || jsonb_build_object('company_slug', c.slug)
         || jsonb_build_object('cardapio_url', ('https://pedido.dominio.tech/' || c.slug))
FROM companies c
WHERE ap.agent_slug = c.slug
  AND (
    ap.vars->>'company_slug' IS NULL OR ap.vars->>'company_slug' = ''
    OR ap.vars->>'cardapio_url' IS NULL OR ap.vars->>'cardapio_url' = ''
  );

-- 2) Normalize any hardcoded links in templates to the variable form
UPDATE ai_agent_prompts
SET template = regexp_replace(
  template,
  'https://pedido\.dominio\.tech/[A-Za-z0-9_-]+',
  'https://pedido.dominio.tech/{{company_slug}}',
  'g'
)
WHERE template LIKE '%https://pedido.dominio.tech/%';

-- 3) Ensure assistants have cardapio_url as extra source of truth
UPDATE ai_agent_assistants a
SET cardapio_url = 'https://pedido.dominio.tech/' || c.slug
FROM companies c
WHERE a.company_id = c.id
  AND (a.cardapio_url IS NULL OR a.cardapio_url = '');

-- 4) Add company_slug to global default vars if missing
UPDATE ai_global_prompt_template
SET default_vars = COALESCE(default_vars, '{}'::jsonb)
                   || jsonb_build_object('company_slug','{{company_slug}}')
WHERE is_active = true;


