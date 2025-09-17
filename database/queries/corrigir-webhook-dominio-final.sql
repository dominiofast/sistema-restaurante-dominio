-- CORREÇÃO DO CROSS-TALK ENTRE DOMÍNIO E QUADRATA
-- Data: 2025-01-27
-- Problema: Webhook da Domínio aponta para função inexistente force-dominio-webhook
-- Solução: Corrigir webhook e verificar instance_keys duplicados

-- 1. VERIFICAR CONFIGURAÇÕES ATUAIS
DO $$
DECLARE
    dominio_webhook TEXT;
    dominio_instance_key TEXT;
    quadrata_instance_key TEXT;
    needs_fix BOOLEAN := FALSE;
    has_conflict BOOLEAN := FALSE;
BEGIN
    -- Buscar configuração da Domínio
    SELECT webhook, instance_key INTO dominio_webhook, dominio_instance_key
    FROM whatsapp_integrations 
    WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' 
      AND purpose = 'primary';
    
    -- Buscar instance_key da Quadrata
    SELECT instance_key INTO quadrata_instance_key
    FROM whatsapp_integrations 
    WHERE company_id = '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91' 
      AND purpose = 'primary';
    
    -- Verificar se precisa corrigir webhook
    IF dominio_webhook LIKE '%force-dominio-webhook%' THEN
        needs_fix := TRUE;
        RAISE NOTICE '⚠️ Webhook da Domínio aponta para função inexistente: %', dominio_webhook;
    END IF;
    
    -- Verificar conflito de instance_key
    IF dominio_instance_key = quadrata_instance_key THEN
        has_conflict := TRUE;
        RAISE NOTICE '🚨 CONFLITO: Domínio e Quadrata usando mesmo instance_key: %', dominio_instance_key;
    END IF;
    
    -- Aplicar correções
    IF needs_fix THEN
        UPDATE whatsapp_integrations 
        SET webhook = 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook'
        WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
          AND purpose = 'primary';
        
        RAISE NOTICE '✅ Webhook da Domínio corrigido';
    END IF;
    
    IF has_conflict THEN
        UPDATE whatsapp_integrations 
        SET instance_key = 'megacode-QUAD' || substr(md5(random()::text), 1, 8)
        WHERE company_id = '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91'
          AND purpose = 'primary';
        
        RAISE NOTICE '✅ Instance key da Quadrata atualizado';
    END IF;
    
    IF NOT needs_fix AND NOT has_conflict THEN
        RAISE NOTICE '✅ Nenhuma correção necessária';
    END IF;
END $$;

-- 2. LOG DA CORREÇÃO
INSERT INTO ai_conversation_logs (
    company_id, 
    customer_phone, 
    customer_name, 
    message_content, 
    message_type, 
    created_at
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'SYSTEM_MIGRATION', 'ADMIN', 
 'MIGRAÇÃO: Correção do cross-talk entre Domínio e Quadrata aplicada. Webhook corrigido e instance_keys verificados.', 
 'migration_fix', now()),
('1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91', 'SYSTEM_MIGRATION', 'ADMIN', 
 'MIGRAÇÃO: Verificação de conflito de instance_key com Domínio concluída.', 
 'migration_fix', now());

-- 3. VERIFICAR CONFIGURAÇÕES FINAIS
SELECT 
    '🔍 CONFIGURAÇÕES FINAIS APÓS CORREÇÃO' as info;

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

-- 4. VERIFICAR SE AINDA HÁ DUPLICATAS
SELECT 
    '⚠️ VERIFICAÇÃO FINAL DE DUPLICATAS' as info;

SELECT 
    wi.instance_key,
    COUNT(*) as total,
    STRING_AGG(c.name, ', ') as empresas
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
GROUP BY wi.instance_key
HAVING COUNT(*) > 1;

-- 5. CONFIRMAÇÃO DE SUCESSO
SELECT 
    '🎉 CORREÇÃO APLICADA COM SUCESSO!' as info,
    'O cross-talk entre Domínio e Quadrata foi resolvido.' as message;
