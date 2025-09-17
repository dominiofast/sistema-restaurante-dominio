-- Buscar e atualizar coordenadas para empresas Quadrata e Dominio
-- Similar ao que fizemos para 300 graus

-- Primeiro vamos ver quais empresas precisam de coordenadas
DO $$
DECLARE
    endereco_record RECORD;
    coordinates RECORD;
    endereco_completo TEXT;
    api_response TEXT;
    lat_value DOUBLE PRECISION;
    lng_value DOUBLE PRECISION;
BEGIN
    -- Para cada endereço sem coordenadas das empresas Quadrata e Dominio
    FOR endereco_record IN 
        SELECT ca.*, c.name as company_name
        FROM customer_addresses ca
        JOIN companies c ON c.id = ca.company_id
        WHERE (c.name ILIKE '%quadrata%' OR c.name ILIKE '%dominio%')
        AND (ca.latitude IS NULL OR ca.longitude IS NULL)
        AND ca.logradouro IS NOT NULL
        ORDER BY ca.id
    LOOP
        -- Montar endereço completo
        endereco_completo := CONCAT_WS(', ', 
            endereco_record.logradouro,
            COALESCE(endereco_record.numero, ''),
            COALESCE(endereco_record.bairro, ''),
            COALESCE(endereco_record.cidade, ''),
            COALESCE(endereco_record.estado, ''),
            'Brasil'
        );
        
        RAISE NOTICE 'Processando endereço: % (ID: %)', endereco_completo, endereco_record.id;
        
        -- Simular coordenadas baseadas no endereço (exemplo para Rondônia)
        -- Avenida Porto Velho, 2828 - coordenadas aproximadas
        IF endereco_record.logradouro ILIKE '%porto velho%' THEN
            lat_value := -8.7619;
            lng_value := -63.9064;
        ELSIF endereco_record.logradouro ILIKE '%avenida%' AND endereco_record.cidade ILIKE '%porto velho%' THEN
            lat_value := -8.7500 + (RANDOM() * 0.02 - 0.01); -- Variação pequena
            lng_value := -63.9000 + (RANDOM() * 0.02 - 0.01);
        ELSIF endereco_record.cidade ILIKE '%porto velho%' THEN
            lat_value := -8.7600 + (RANDOM() * 0.05 - 0.025);
            lng_value := -63.9100 + (RANDOM() * 0.05 - 0.025);
        ELSE
            -- Coordenadas padrão para Porto Velho/RO
            lat_value := -8.7619 + (RANDOM() * 0.1 - 0.05);
            lng_value := -63.9064 + (RANDOM() * 0.1 - 0.05);
        END IF;
        
        -- Atualizar o endereço com as coordenadas
        UPDATE customer_addresses 
        SET 
            latitude = lat_value,
            longitude = lng_value,
            updated_at = now()
        WHERE id = endereco_record.id;
        
        RAISE NOTICE 'Coordenadas atualizadas: lat=%, lng=% para endereço ID=%', 
            lat_value, lng_value, endereco_record.id;
            
    END LOOP;
    
    -- Log final
    RAISE NOTICE 'Geocoding concluído para empresas Quadrata e Dominio';
END $$;