-- Atualizar webhook do Domínio Pizzas para usar o webhook forçado temporariamente
UPDATE whatsapp_integrations 
SET webhook = 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/force-dominio-webhook/megacode-MDT3OHEGIyu'
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
AND instance_key = 'megacode-MDT3OHEGIyu';

-- Log da correção
INSERT INTO public.ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', '69992254080', 'Cleber RC',
    'WEBHOOK TEMPORÁRIO: Forçando webhook específico para Domínio Pizzas resolver problema de cross-talk',
    'webhook_force_fix', now()
);