-- ========================================
-- DEBUG: VERIFICAR POR QUE NÃO ESTÁ FUNCIONANDO
-- ========================================

-- 1. VER SE O TRIGGER FOI CRIADO
SELECT 'VERIFICANDO TRIGGERS:' as info;
SELECT 
    trigger_name, 
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos'
AND trigger_name ILIKE '%confirmacao%'
ORDER BY trigger_name;

-- 2. VER SE A FUNÇÃO EXISTE
SELECT 'VERIFICANDO FUNÇÕES:' as info;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name ILIKE '%confirmacao%'
AND routine_schema = 'public';

-- 3. TESTAR WHATSAPP CONFIG
SELECT 'VERIFICANDO WHATSAPP CONFIG:' as info;
SELECT 
    company_id,
    instance_key,
    is_active,
    LEFT(token, 20) || '...' as token_preview
FROM whatsapp_integrations 
WHERE is_active = true
ORDER BY company_id;

-- 4. VER ÚLTIMO PEDIDO E STATUS
SELECT 'ÚLTIMO PEDIDO:' as info;
SELECT 
    id,
    numero_pedido,
    nome,
    telefone,
    status,
    created_at
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. CRIAR TRIGGER MAIS SIMPLES PARA TESTE
CREATE OR REPLACE FUNCTION teste_confirmacao_simples()
RETURNS TRIGGER AS $$
DECLARE
    config RECORD;
    msg TEXT;
BEGIN
    -- Log no banco para debug
    INSERT INTO ai_conversation_logs (
        company_id, 
        customer_phone, 
        customer_name, 
        message_content, 
        message_type, 
        created_at
    ) VALUES (
        NEW.company_id,
        NEW.telefone,
        NEW.nome,
        'TESTE TRIGGER: Pedido #' || NEW.id || ' mudou para ' || NEW.status,
        'debug',
        NOW()
    );
    
    -- Se mudou para confirmado, tentar enviar
    IF NEW.status = 'confirmado' THEN
        SELECT * INTO config 
        FROM whatsapp_integrations 
        WHERE company_id = NEW.company_id AND is_active = true
        LIMIT 1;
        
        IF config IS NOT NULL THEN
            msg := '*TESTE: Pedido nº ' || COALESCE(NEW.numero_pedido, NEW.id) || ' confirmado!*' || E'\n\n' ||
                   'Cliente: ' || NEW.nome || E'\n' ||
                   'Total: R$ ' || REPLACE(NEW.total::text, '.', ',') || E'\n\n' ||
                   'Obrigado pela preferência! 😊';
            
            BEGIN
                PERFORM http_post(
                    'https://apinocode01.megaapi.com.br/rest/sendMessage/' || config.instance_key || '/text',
                    json_build_object(
                        'messageData', json_build_object(
                            'to', NEW.telefone,
                            'text', msg
                        )
                    )::text,
                    'application/json',
                    ARRAY[
                        http_header('Authorization', 'Bearer ' || config.token),
                        http_header('Content-Type', 'application/json')
                    ]
                );
                
                -- Log sucesso
                INSERT INTO ai_conversation_logs (
                    company_id, customer_phone, customer_name, message_content, message_type, created_at
                ) VALUES (
                    NEW.company_id, NEW.telefone, NEW.nome,
                    'WHATSAPP ENVIADO: ' || msg, 'notification_sent', NOW()
                );
                
            EXCEPTION
                WHEN OTHERS THEN
                    -- Log erro
                    INSERT INTO ai_conversation_logs (
                        company_id, customer_phone, customer_name, message_content, message_type, created_at
                    ) VALUES (
                        NEW.company_id, NEW.telefone, NEW.nome,
                        'ERRO WHATSAPP: ' || SQLERRM, 'notification_error', NOW()
                    );
            END;
        ELSE
            -- Log se não tem config
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                NEW.company_id, NEW.telefone, NEW.nome,
                'ERRO: WhatsApp não configurado para company_id ' || NEW.company_id, 'config_error', NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGER DE TESTE
DROP TRIGGER IF EXISTS trigger_teste_confirmacao ON pedidos;
CREATE TRIGGER trigger_teste_confirmacao
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION teste_confirmacao_simples();

-- 7. VERIFICAR SE CRIOU
SELECT 'TRIGGER DE TESTE CRIADO:' as info;
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_teste_confirmacao';
