-- Verificar configurações WhatsApp e identificar possíveis conflitos
SELECT 
    '🔍 VERIFICAÇÃO DE CONFIGURAÇÕES WHATSAPP' as info;

-- Verificar todas as integrações WhatsApp
SELECT 
    '📱 TODAS AS INTEGRAÇÕES WHATSAPP' as info;

SELECT 
    wi.id,
    c.name as empresa,
    c.slug,
    wi.instance_key,
    wi.host,
    wi.webhook,
    wi.purpose,
    wi.is_active,
    wi.created_at
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
ORDER BY c.name, wi.purpose;

-- Verificar se há instance_keys duplicados
SELECT 
    '⚠️ INSTANCE_KEYS DUPLICADOS' as info;

SELECT 
    wi.instance_key,
    COUNT(*) as total_integracoes,
    STRING_AGG(c.name, ', ') as empresas
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
GROUP BY wi.instance_key
HAVING COUNT(*) > 1;

-- Verificar webhooks diferentes para a mesma empresa
SELECT 
    '🌐 WEBHOOKS DIFERENTES POR EMPRESA' as info;

SELECT 
    c.name as empresa,
    COUNT(DISTINCT wi.webhook) as webhooks_diferentes,
    STRING_AGG(DISTINCT wi.webhook, ' | ') as webhooks
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
GROUP BY c.id, c.name
HAVING COUNT(DISTINCT wi.webhook) > 1;

-- Verificar especificamente Domínio e Quadrata
SELECT 
    '🍕 DOMÍNIO E QUADRATA ESPECÍFICOS' as info;

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
   OR c.slug ILIKE '%domínio%'
   OR c.slug ILIKE '%quadrata%'
ORDER BY c.name;

-- Verificar se há webhooks apontando para funções específicas
SELECT 
    '🔗 WEBHOOKS ESPECÍFICOS' as info;

SELECT 
    c.name as empresa,
    wi.webhook,
    wi.instance_key,
    wi.purpose
FROM whatsapp_integrations wi
JOIN companies c ON c.id = wi.company_id
WHERE wi.webhook LIKE '%force-dominio%'
   OR wi.webhook LIKE '%dominio.tech%'
   OR wi.webhook LIKE '%quadrata%'
ORDER BY c.name;

-- Verificar logs recentes de conversas para identificar cross-talk
SELECT 
    '📝 LOGS RECENTES DE CONVERSAS' as info;

SELECT 
    c.name as empresa,
    acl.customer_phone,
    acl.customer_name,
    acl.message_content,
    acl.message_type,
    acl.created_at
FROM ai_conversation_logs acl
JOIN companies c ON c.id = acl.company_id
WHERE acl.created_at > NOW() - INTERVAL '24 hours'
  AND (c.name ILIKE '%domínio%' OR c.name ILIKE '%quadrata%')
ORDER BY acl.created_at DESC
LIMIT 20;
