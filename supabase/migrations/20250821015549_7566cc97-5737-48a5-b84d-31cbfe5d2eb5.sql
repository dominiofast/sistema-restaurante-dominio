-- ✅ RESTAURAR INTEGRAÇÕES WHATSAPP (só as que eu quebrei)
UPDATE whatsapp_integrations 
SET host = 'apinocode01.megaapi.com.br'
WHERE host IS NULL;

-- ✅ RESTAURAR TOKENS PARA AS INSTÂNCIAS ATIVAS
UPDATE whatsapp_integrations 
SET token = instance_key
WHERE token IS NULL AND instance_key IS NOT NULL;

-- ✅ REATIVAR APENAS OS ASSISTANTS DA OPENAI (não as conversas automáticas)
UPDATE ai_agent_assistants 
SET is_active = true;

-- ✅ MANTER APENAS AI_AGENT_CONFIG DESATIVADO (era isso que controlava as conversas automáticas)
-- Deixar is_active = false no ai_agent_config para não enviar respostas automáticas

-- Verificar o que foi restaurado
SELECT 
    'whatsapp_integrations' as tabela,
    COUNT(*) as restaurados
FROM whatsapp_integrations 
WHERE host IS NOT NULL AND token IS NOT NULL

UNION ALL

SELECT 
    'ai_agent_assistants' as tabela,
    COUNT(*) as restaurados
FROM ai_agent_assistants 
WHERE is_active = true;

-- Log da correção
INSERT INTO public.ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'ADMIN', 
    '✅ CORRIGIDO: WhatsApp restaurado, apenas conversas de IA mantidas pausadas como solicitado',
    'system_corrected',
    now()
);