-- Corrigir as variáveis do template do dominiopizzas para usar os nomes corretos
UPDATE ai_agent_prompts 
SET vars = jsonb_set(
  jsonb_set(
    jsonb_set(vars, '{contact_phone}', vars->'telefone'),
    '{contact_address}', vars->'company_address'
  ),
  '{opening_hours}', vars->'working_hours'
)
WHERE agent_slug = 'dominiopizzas';

-- Remover as variáveis antigas
UPDATE ai_agent_prompts 
SET vars = vars - 'telefone' - 'company_address' - 'working_hours'
WHERE agent_slug = 'dominiopizzas';