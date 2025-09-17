-- Verificar se há problemas de índice único e corrigir
-- Primeiro, vamos remover qualquer possível duplicata oculta

-- Deletar todas as integrações do Domínio temporariamente
DELETE FROM whatsapp_integrations 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Recriar a integração do Domínio Pizzas de forma limpa
INSERT INTO whatsapp_integrations (
    id,
    company_id,
    instance_key,
    host,
    control_id,
    token,
    purpose,
    webhook
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'megacode-MDT3OHEGIyu',
    'apinocode01.megaapi.com.br',
    'ac666764-a68b-43d9-98af-d498c2c41661',
    'MDT3OHEGIyu',
    'primary',
    'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/force-dominio-webhook/megacode-MDT3OHEGIyu'
);

-- Log da correção
INSERT INTO public.ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', '69992254080', 'Cleber RC',
    'CORREÇÃO DUPLICATAS: Integração Domínio Pizzas recriada de forma limpa',
    'duplicate_fix', now()
);