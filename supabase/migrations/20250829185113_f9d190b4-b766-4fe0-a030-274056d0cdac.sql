-- Remover formas de pagamento fixas dos prompts para que sejam buscadas dinamicamente
UPDATE ai_agent_prompts 
SET vars = vars - 'payment_methods'
WHERE agent_slug IN ('dominiopizzas', 'quadratapizzas', '300graus', 'cookielab');