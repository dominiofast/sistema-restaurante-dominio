-- Adicionar campo order_position para categorias de adicionais
ALTER TABLE categorias_adicionais 
ADD COLUMN IF NOT EXISTS order_position INTEGER DEFAULT 0;

-- Adicionar campo order_position para adicionais
ALTER TABLE adicionais 
ADD COLUMN IF NOT EXISTS order_position INTEGER DEFAULT 0;

-- Atualizar posições existentes para categorias de adicionais
UPDATE categorias_adicionais 
SET order_position = ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY created_at)
WHERE order_position = 0;

-- Atualizar posições existentes para adicionais
UPDATE adicionais 
SET order_position = ROW_NUMBER() OVER (PARTITION BY categoria_adicional_id ORDER BY created_at)
WHERE order_position = 0;