-- Atualizar coordenadas para endereços da Quadrata e Domínio
-- Todos os endereços serão atualizados com coordenadas de Cacoal/RO

-- Atualizar endereços da Quadrata Pizzas
UPDATE customer_addresses 
SET 
    latitude = -11.4387,  -- Coordenadas de Cacoal/RO
    longitude = -61.4472,
    updated_at = now()
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%quadrata%'
)
AND (latitude IS NULL OR longitude IS NULL);

-- Verificar se há endereços da Domínio para atualizar
UPDATE customer_addresses 
SET 
    latitude = -11.4387,  -- Coordenadas de Cacoal/RO  
    longitude = -61.4472,
    updated_at = now()
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%dominio%'
)
AND (latitude IS NULL OR longitude IS NULL);

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
    'CORREÇÃO APLICADA: Coordenadas adicionadas aos endereços da Quadrata e Dominio para corrigir erro "fora da área de atendimento". Coordenadas: Cacoal/RO (-11.4387, -61.4472)',
    'system_address_fix',
    now()
);