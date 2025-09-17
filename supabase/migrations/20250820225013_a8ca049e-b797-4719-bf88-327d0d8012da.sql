-- Corrigir preço promocional do produto Esfihas Salgadas
UPDATE produtos 
SET promotional_price = NULL, 
    is_promotional = false
WHERE name = 'Esfihas Salgadas' 
  AND company_id = '550e8400-e29b-41d4-a716-446655440001';