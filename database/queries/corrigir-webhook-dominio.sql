-- CORREÇÃO DO PROBLEMA DE CROSS-TALK ENTRE DOMÍNIO E QUADRATA
-- O problema é que o webhook está apontando para uma função inexistente

-- 1. VERIFICAR CONFIGURAÇÕES ATUAIS
SELECT 
    '🔍 CONFIGURAÇÕES ATUAIS' as info;

SELECT 
    c.name as empresa,
    c.slug,
    wi.instance_key,
    wi.webhook,
    wi.purpose,
    wi.is_active
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
WHERE c.name ILIKE '%domínio%' 
   OR c.name ILIKE '%quadrata%'
ORDER BY c.name;

-- 2. CORRIGIR WEBHOOK DA DOMÍNIO
-- Remover webhook que aponta para função inexistente e usar o webhook padrão
UPDATE whatsapp_integrations 
SET webhook = 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook'
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
  AND webhook LIKE '%force-dominio-webhook%';

-- 3. VERIFICAR SE HÁ INSTANCE_KEYS DUPLICADOS
SELECT 
    '⚠️ VERIFICANDO INSTANCE_KEYS DUPLICADOS' as info;

SELECT 
    wi.instance_key,
    COUNT(*) as total,
    STRING_AGG(c.name, ', ') as empresas
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
GROUP BY wi.instance_key
HAVING COUNT(*) > 1;

-- 4. SE HOUVER DUPLICATAS, CORRIGIR
-- (Este bloco será executado apenas se houver duplicatas)
DO $$
DECLARE
    dominio_instance_key TEXT;
    quadrata_instance_key TEXT;
BEGIN
    -- Buscar instance_keys atuais
    SELECT instance_key INTO dominio_instance_key
    FROM whatsapp_integrations 
    WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' 
      AND purpose = 'primary';
    
    SELECT instance_key INTO quadrata_instance_key
    FROM whatsapp_integrations 
    WHERE company_id = '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91' 
      AND purpose = 'primary';
    
    -- Se são iguais, gerar novo para Quadrata
    IF dominio_instance_key = quadrata_instance_key THEN
        UPDATE whatsapp_integrations 
        SET instance_key = 'megacode-QUAD' || substr(md5(random()::text), 1, 8)
        WHERE company_id = '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91' 
          AND purpose = 'primary';
        
        RAISE NOTICE '🚨 INSTANCE_KEY DUPLICADO CORRIGIDO: Quadrata recebeu novo instance_key';
    END IF;
END $$;

-- 5. VERIFICAR CONFIGURAÇÕES FINAIS
SELECT 
    '✅ CONFIGURAÇÕES FINAIS' as info;

SELECT 
    c.name as empresa,
    c.slug,
    wi.instance_key,
    wi.webhook,
    wi.purpose,
    wi.is_active
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
WHERE c.name ILIKE '%domínio%' 
   OR c.name ILIKE '%quadrata%'
ORDER BY c.name;

-- 6. LOG DA CORREÇÃO
INSERT INTO ai_conversation_logs (
    company_id, 
    customer_phone, 
    customer_name, 
    message_content, 
    message_type, 
    created_at
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'SYSTEM', 'ADMIN', 
 'CORREÇÃO WEBHOOK: Removido webhook inexistente force-dominio-webhook. Agora usando webhook padrão.', 
 'webhook_fix', now()),
('1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91', 'SYSTEM', 'ADMIN', 
 'CORREÇÃO WEBHOOK: Verificado se instance_key não está duplicado com Domínio.', 
 'webhook_fix', now());

SELECT 
    '🎉 CORREÇÃO APLICADA COM SUCESSO!' as info;
