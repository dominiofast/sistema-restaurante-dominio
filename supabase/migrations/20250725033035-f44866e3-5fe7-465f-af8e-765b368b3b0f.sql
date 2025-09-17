-- Corrigir todas as categorias que têm max_selection > 1 mas selection_type = 'single'
UPDATE categorias_adicionais 
SET selection_type = 'multiple' 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' 
AND max_selection > 1 
AND selection_type = 'single';