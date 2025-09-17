-- Corrigir endereço do cliente que está sem coordenadas
-- O endereço está dentro da área de atendimento, mas faltam as coordenadas

UPDATE customer_addresses 
SET 
    latitude = -11.4387,
    longitude = -61.4472,
    updated_at = now()
WHERE id = '3e5df167-4f5c-4542-9776-c31a53d7a3f3'
AND customer_phone = '69992254080'
AND logradouro = 'Avenida Porto Velho'
AND numero = '2828';

-- Log da correção
INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '69992254080',
    'Cleber RC',
    '🔧 CORREÇÃO AUTOMÁTICA: Endereço Avenida Porto Velho 2828 atualizado com coordenadas corretas. Distância calculada: 0.303km (DENTRO de todas as áreas de atendimento 1-7km)',
    'endereco_coordenadas_corrigidas',
    now()
);