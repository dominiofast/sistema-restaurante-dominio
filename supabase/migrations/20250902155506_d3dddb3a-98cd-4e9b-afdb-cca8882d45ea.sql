-- Corrigir coordenadas dos endereços da empresa 300 graus
UPDATE customer_addresses 
SET 
    latitude = CASE 
        WHEN UPPER(bairro) LIKE '%CENTRO%' THEN -11.436026
        WHEN UPPER(bairro) LIKE '%JARDIM%' THEN -11.440000
        WHEN UPPER(bairro) LIKE '%VILA%' THEN -11.445000
        ELSE -11.436026 -- Centro como padrão
    END,
    longitude = CASE 
        WHEN UPPER(bairro) LIKE '%CENTRO%' THEN -61.4463658
        WHEN UPPER(bairro) LIKE '%JARDIM%' THEN -61.4500000
        WHEN UPPER(bairro) LIKE '%VILA%' THEN -61.4400000
        ELSE -61.4463658 -- Centro como padrão
    END
WHERE company_id = '11e10dba-8ed0-47fc-91f5-bc88f2aef4ca'
AND (latitude IS NULL OR longitude IS NULL)
AND cidade = 'Cacoal' 
AND estado = 'RO';

-- Verificar resultado
SELECT 
    COUNT(*) as total_enderecos,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas,
    COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as sem_coordenadas
FROM customer_addresses 
WHERE company_id = '11e10dba-8ed0-47fc-91f5-bc88f2aef4ca';