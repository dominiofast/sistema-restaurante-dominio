-- Remover formas de pagamento fixas dos prompts para que sejam buscadas dinamicamente
UPDATE ai_agent_prompts 
SET vars = vars - 'payment_methods'
WHERE agent_slug IN ('dominiopizzas', 'quadratapizzas', '300graus', 'cookielab');

-- Verificar se as bandeiras estão configuradas para Domínio Pizzas
SELECT 
  pdc.company_id,
  pdc.accept_cash,
  pdc.accept_card,
  pdc.accept_pix,
  pdc.ask_card_brand,
  array_agg(cb.brand_name) as configured_brands
FROM payment_delivery_config pdc
LEFT JOIN card_brands cb ON cb.payment_config_id = pdc.id
WHERE pdc.company_id = '550e8400-e29b-41d4-a716-446655440001'
GROUP BY pdc.company_id, pdc.accept_cash, pdc.accept_card, pdc.accept_pix, pdc.ask_card_brand;