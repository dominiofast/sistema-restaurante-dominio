-- Atualizar as coordenadas do endereço da CookieLab para o bairro Paineiras
-- Coordenadas aproximadas do Residencial Paineiras em Cacoal/RO
UPDATE company_addresses 
SET 
    latitude = -11.448525,
    longitude = -61.447891,
    updated_at = now()
WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06';

-- Atualizar as regiões de atendimento por raio para usar as coordenadas corretas do Paineiras
UPDATE regioes_atendimento 
SET 
    centro_lat = -11.448525,
    centro_lng = -61.447891
WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06' 
AND tipo = 'raio';