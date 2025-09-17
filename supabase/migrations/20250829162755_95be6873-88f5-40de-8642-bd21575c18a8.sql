-- 🚨 CORREÇÃO URGENTE: Forçar sincronização do assistant Domínio Pizzas

-- 1. Resetar configuração do assistant para forçar nova sincronização
UPDATE ai_agent_assistants 
SET 
    use_direct_mode = true,
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 2. Log da ação
INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'ADMIN',
    '🚨 CORREÇÃO APLICADA: Assistant forçado a usar horários REAIS - Domingo: 17:45-23:59 | Segunda: 17:45-23:30 | Terça: 17:45-23:30 | Quarta: 10:45-23:30 | Quinta: 17:45-23:30 | Sexta: 17:45-23:30 | Sábado: 17:45-23:30 - Teste agora perguntando "vocês estão abertos?"',
    'horarios_reais_aplicados',
    NOW()
);

-- 3. Verificar resultado final
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    use_direct_mode,
    is_active,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';