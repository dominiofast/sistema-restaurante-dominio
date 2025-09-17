-- Corrigir produtos órfãos sem categoria
-- Primeiro, criar uma categoria padrão para produtos órfãos se não existir

-- Para cada empresa, criar uma categoria "Diversos" se não existir
DO $$
DECLARE
    company_record RECORD;
    categoria_diversos_id UUID;
BEGIN
    -- Para cada empresa que tem produtos órfãos
    FOR company_record IN 
        SELECT DISTINCT p.company_id, c.name as company_name
        FROM produtos p 
        LEFT JOIN companies c ON c.id = p.company_id
        WHERE p.categoria_id IS NULL AND p.is_available = true
    LOOP
        -- Verificar se já existe categoria "Diversos" para esta empresa
        SELECT id INTO categoria_diversos_id
        FROM categorias 
        WHERE company_id = company_record.company_id 
        AND name = 'Diversos'
        LIMIT 1;
        
        -- Se não existe, criar categoria "Diversos"
        IF categoria_diversos_id IS NULL THEN
            INSERT INTO categorias (company_id, name, description, is_active, order_position)
            VALUES (
                company_record.company_id,
                'Diversos',
                'Produtos diversos',
                true,
                999
            ) RETURNING id INTO categoria_diversos_id;
        END IF;
        
        -- Atualizar produtos órfãos para usar esta categoria
        UPDATE produtos 
        SET categoria_id = categoria_diversos_id
        WHERE company_id = company_record.company_id 
        AND categoria_id IS NULL 
        AND is_available = true;
        
        RAISE NOTICE 'Produtos órfãos da empresa % vinculados à categoria Diversos', company_record.company_name;
    END LOOP;
END $$;