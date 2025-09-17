UPDATE ai_agent_prompts 
SET vars = jsonb_set(
  vars,
  '{link_cardapio}',
  '"https://pedido.dominio.tech/300graus"'
)
WHERE agent_slug = '300graus';