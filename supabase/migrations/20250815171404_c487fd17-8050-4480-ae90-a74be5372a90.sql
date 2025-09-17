-- Forçar uma limpeza COMPLETA dos links corrompidos
UPDATE ai_agent_assistants 
SET cardapio_url = 'https://pedido.dominio.tech/' || (SELECT slug FROM companies WHERE companies.id = ai_agent_assistants.company_id)
WHERE cardapio_url IS NOT NULL;

-- Verificar se ainda há algum link corrompido
UPDATE ai_agent_prompts 
SET vars = jsonb_set(
  vars, 
  '{cardapio_url}', 
  to_jsonb('https://pedido.dominio.tech/' || agent_slug)
)
WHERE vars ? 'cardapio_url';