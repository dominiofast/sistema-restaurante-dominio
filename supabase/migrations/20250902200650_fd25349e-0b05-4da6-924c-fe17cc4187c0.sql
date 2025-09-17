-- Correção específica para Domínio Pizzas (com acento)
-- A empresa não foi encontrada na migração anterior porque estava sendo procurada sem acento

-- Atualizar coordenadas dos endereços da Domínio Pizzas
UPDATE customer_addresses 
SET 
    latitude = -11.4387,  -- Coordenadas de Cacoal/RO
    longitude = -61.4472
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'  -- ID específico da Domínio Pizzas
AND (latitude IS NULL OR longitude IS NULL);

-- Criar região de atendimento para Domínio Pizzas
INSERT INTO delivery_regions (company_id, name, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',  -- ID específico da Domínio Pizzas
    'Cacoal - Centro',
    true
)
ON CONFLICT DO NOTHING;  -- Evitar duplicatas se já existir

-- Criar área de entrega por raio coordenado para Domínio Pizzas (raio de 10km)
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
WHERE dr.company_id = '550e8400-e29b-41d4-a716-446655440001'  -- ID específico da Domínio Pizzas
AND NOT EXISTS (
    SELECT 1 FROM delivery_region_areas dra WHERE dra.region_id = dr.id
);

-- Verificar se a correção funcionou
SELECT 
    'VERIFICAÇÃO DOMÍNIO' as status,
    c.name,
    COUNT(DISTINCT ca.id) as total_enderecos,
    COUNT(DISTINCT CASE WHEN ca.latitude IS NOT NULL THEN ca.id END) as enderecos_com_coordenadas,
    COUNT(DISTINCT dr.id) as regioes_entrega,
    COUNT(DISTINCT dra.id) as areas_entrega
FROM companies c
LEFT JOIN customer_addresses ca ON ca.company_id = c.id
LEFT JOIN delivery_regions dr ON dr.company_id = c.id
LEFT JOIN delivery_region_areas dra ON dra.region_id = dr.id
WHERE c.id = '550e8400-e29b-41d4-a716-446655440001'
GROUP BY c.name;

-- Log da correção específica
INSERT INTO public.ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'DOMINIO_FIX',
    'CORREÇÃO ESPECÍFICA DOMÍNIO: Problema era busca sem acento. Coordenadas adicionadas e região criada para Domínio Pizzas (ID: 550e8400-e29b-41d4-a716-446655440001)',
    'system_dominio_fix',
    now()
);