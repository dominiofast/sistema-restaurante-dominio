-- Atualizar coordenadas para endereços da Quadrata e Domínio
-- Todos os endereços serão atualizados com coordenadas de Cacoal/RO

-- Atualizar endereços da Quadrata Pizzas
UPDATE customer_addresses 
SET 
    latitude = -11.4387,  -- Coordenadas de Cacoal/RO
    longitude = -61.4472
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%quadrata%'
)
AND (latitude IS NULL OR longitude IS NULL);

-- Verificar se há endereços da Domínio para atualizar
UPDATE customer_addresses 
SET 
    latitude = -11.4387,  -- Coordenadas de Cacoal/RO  
    longitude = -61.4472
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%dominio%'
)
AND (latitude IS NULL OR longitude IS NULL);

-- Criar região de atendimento para Quadrata
INSERT INTO delivery_regions (company_id, name, is_active)
SELECT 
    id,
    'Cacoal - Centro',
    true
FROM companies 
WHERE name ILIKE '%quadrata%'
AND NOT EXISTS (
    SELECT 1 FROM delivery_regions dr WHERE dr.company_id = companies.id
);

-- Criar região de atendimento para Domínio  
INSERT INTO delivery_regions (company_id, name, is_active)
SELECT 
    id,
    'Cacoal - Centro', 
    true
FROM companies 
WHERE name ILIKE '%dominio%'
AND NOT EXISTS (
    SELECT 1 FROM delivery_regions dr WHERE dr.company_id = companies.id
);

-- Criar área de entrega por raio coordenado para Quadrata (raio de 10km)
INSERT INTO delivery_region_areas (region_id, area_type, area_data)
SELECT 
    dr.id,
    'coordinate_radius',
    jsonb_build_object(
        'center', jsonb_build_object(
            'lat', -11.4387,
            'lng', -61.4472
        ),
        'radius', 10000
    )
FROM delivery_regions dr
JOIN companies c ON c.id = dr.company_id
WHERE c.name ILIKE '%quadrata%'
AND NOT EXISTS (
    SELECT 1 FROM delivery_region_areas dra WHERE dra.region_id = dr.id
);

-- Criar área de entrega por raio coordenado para Domínio (raio de 10km)
INSERT INTO delivery_region_areas (region_id, area_type, area_data)
SELECT 
    dr.id,
    'coordinate_radius',
    jsonb_build_object(
        'center', jsonb_build_object(
            'lat', -11.4387,
            'lng', -61.4472
        ),
        'radius', 10000
    )
FROM delivery_regions dr
JOIN companies c ON c.id = dr.company_id
WHERE c.name ILIKE '%dominio%'
AND NOT EXISTS (
    SELECT 1 FROM delivery_region_areas dra WHERE dra.region_id = dr.id
);

-- Log da correção
INSERT INTO public.ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    (SELECT id FROM companies WHERE name ILIKE '%quadrata%' LIMIT 1),
    'SYSTEM',
    'COORDENADAS_FIX',
    'CORREÇÃO COMPLETA: Coordenadas adicionadas aos endereços e regiões de atendimento criadas para Quadrata e Dominio. Coordenadas: Cacoal/RO (-11.4387, -61.4472) com raio de 10km usando coordinate_radius',
    'system_address_fix',
    now()
);