-- Adicionar campo order_position para categorias de adicionais
ALTER TABLE categorias_adicionais 
ADD COLUMN IF NOT EXISTS order_position INTEGER DEFAULT 0;

-- Adicionar campo order_position para adicionais
ALTER TABLE adicionais 
ADD COLUMN IF NOT EXISTS order_position INTEGER DEFAULT 0;

-- Função para atualizar posições de categorias de adicionais
DO $$ 
DECLARE
    r RECORD;
    pos INTEGER;
BEGIN
    FOR r IN SELECT DISTINCT company_id FROM categorias_adicionais LOOP
        pos := 0;
        FOR r IN SELECT id FROM categorias_adicionais 
                 WHERE company_id = r.company_id 
                 ORDER BY created_at LOOP
            pos := pos + 1;
            UPDATE categorias_adicionais 
            SET order_position = pos 
            WHERE id = r.id AND order_position = 0;
        END LOOP;
    END LOOP;
END $$;

-- Função para atualizar posições de adicionais
DO $$ 
DECLARE
    r RECORD;
    pos INTEGER;
BEGIN
    FOR r IN SELECT DISTINCT categoria_adicional_id FROM adicionais LOOP
        pos := 0;
        FOR r IN SELECT id FROM adicionais 
                 WHERE categoria_adicional_id = r.categoria_adicional_id 
                 ORDER BY created_at LOOP
            pos := pos + 1;
            UPDATE adicionais 
            SET order_position = pos 
            WHERE id = r.id AND order_position = 0;
        END LOOP;
    END LOOP;
END $$;