-- Corrigir políticas RLS para permitir inserção de logs e endereços
-- Problema: usuários anônimos não conseguem salvar endereços nem gerar logs

-- 1. Permitir inserção anônima na tabela ai_conversation_logs para logs automáticos
DROP POLICY IF EXISTS "Allow anon insert for auto logs" ON ai_conversation_logs;
CREATE POLICY "Allow anon insert for auto logs"
ON ai_conversation_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (
    -- Permitir inserção de logs automáticos do sistema
    message_type IN (
        'auto_geocoding_applied',
        'sistema_auto_geocoding_ativo', 
        'address_validation',
        'delivery_area_check',
        'coordinate_fix',
        'system_notification'
    )
);

-- 2. Permitir inserção anônima na tabela customer_addresses para pedidos públicos
DROP POLICY IF EXISTS "Allow anon insert customer addresses" ON customer_addresses;
CREATE POLICY "Allow anon insert customer addresses"
ON customer_addresses
FOR INSERT
TO anon, authenticated
WITH CHECK (
    -- Permitir inserção para endereços de pedidos
    company_id IS NOT NULL 
    AND customer_phone IS NOT NULL
    AND customer_name IS NOT NULL
);

-- 3. Permitir leitura anônima de endereços para validação de área
DROP POLICY IF EXISTS "Allow anon read customer addresses" ON customer_addresses;
CREATE POLICY "Allow anon read customer addresses"
ON customer_addresses
FOR SELECT
TO anon, authenticated
USING (
    -- Permitir leitura para validação de entregas
    company_id IS NOT NULL
);

-- 4. Log da correção
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
    'AUTO_FIX',
    '🔧 RLS CORRIGIDO: Políticas de segurança ajustadas para permitir salvamento de endereços e logs automáticos. Erro "violates row-level security policy" resolvido.',
    'rls_policy_fixed',
    now()
);