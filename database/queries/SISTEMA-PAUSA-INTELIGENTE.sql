-- SISTEMA DE PAUSA INTELIGENTE COM DETECÇÃO AUTOMÁTICA
-- Execute no SQL Editor do Supabase

-- 1. ADICIONAR CAMPO DE TIMEOUT NA TABELA EXISTENTE
ALTER TABLE whatsapp_chats 
ADD COLUMN IF NOT EXISTS pause_timeout_at TIMESTAMP WITH TIME ZONE;

-- 2. FUNÇÃO PARA DETECTAR SE CLIENTE QUER ATENDENTE
CREATE OR REPLACE FUNCTION detect_human_attendant_request(message_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Converter para minúsculas para facilitar comparação
    message_text := lower(message_text);
    
    -- Padrões que indicam que o cliente quer falar com atendente
    RETURN (
        message_text LIKE '%atendente%' OR
        message_text LIKE '%atendimento humano%' OR
        message_text LIKE '%falar com alguém%' OR
        message_text LIKE '%falar com uma pessoa%' OR
        message_text LIKE '%quero falar com%' AND (message_text LIKE '%atendente%' OR message_text LIKE '%alguém%' OR message_text LIKE '%pessoa%') OR
        message_text LIKE '%preciso falar com%' AND (message_text LIKE '%atendente%' OR message_text LIKE '%alguém%' OR message_text LIKE '%pessoa%') OR
        message_text LIKE '%pode me ajudar%' AND (message_text LIKE '%atendente%' OR message_text LIKE '%alguém%' OR message_text LIKE '%pessoa%') OR
        message_text LIKE '%não estou conseguindo%' OR
        message_text LIKE '%problema com%' OR
        message_text LIKE '%erro no%' OR
        message_text LIKE '%não funciona%' OR
        message_text LIKE '%preciso de ajuda%' OR
        message_text LIKE '%urgente%' OR
        message_text LIKE '%emergência%' OR
        message_text LIKE '%problema urgente%' OR
        message_text LIKE '%não consigo fazer%' OR
        message_text LIKE '%estou com dificuldade%' OR
        message_text LIKE '%não entendo%' OR
        message_text LIKE '%confuso%' OR
        message_text LIKE '%frustrado%' OR
        message_text LIKE '%irritado%' OR
        message_text LIKE '%chateado%' OR
        message_text LIKE '%insatisfeito%' OR
        message_text LIKE '%reclamação%' OR
        message_text LIKE '%reclamar%' OR
        message_text LIKE '%problema%' AND (message_text LIKE '%atendente%' OR message_text LIKE '%alguém%' OR message_text LIKE '%pessoa%')
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. FUNÇÃO PARA PAUSAR AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION auto_pause_for_human_attendant(
    p_company_id UUID,
    p_chat_id VARCHAR(255),
    p_customer_phone VARCHAR(20),
    p_customer_name VARCHAR(255),
    p_message TEXT,
    p_timeout_hours INTEGER DEFAULT 1
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_alert_message TEXT;
BEGIN
    -- Pausar o chat
    UPDATE whatsapp_chats
    SET ai_paused = true,
        pause_timeout_at = now() + (p_timeout_hours || ' hours')::INTERVAL,
        updated_at = now()
    WHERE company_id = p_company_id 
    AND chat_id = p_chat_id;
    
    -- Criar mensagem de alerta
    v_alert_message := '🚨 ATENDIMENTO HUMANO SOLICITADO!' || E'\n\n' ||
                      '👤 Cliente: ' || COALESCE(p_customer_name, 'Não informado') || E'\n' ||
                      '📱 Telefone: ' || p_customer_phone || E'\n' ||
                      '💬 Mensagem: "' || p_message || '"' || E'\n\n' ||
                      '⏰ Pausa automática ativada por ' || p_timeout_hours || ' hora(s)' || E'\n' ||
                      '🔔 Alerta sonoro e visual ativado';
    
    -- Log da pausa automática
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        p_company_id,
        p_customer_phone,
        p_customer_name,
        v_alert_message,
        'auto_pause_human_request',
        now()
    );
    
    v_result := json_build_object(
        'success', true,
        'message', 'Pausa automática ativada com sucesso',
        'chat_id', p_chat_id,
        'customer_name', p_customer_name,
        'customer_phone', p_customer_phone,
        'timeout_at', now() + (p_timeout_hours || ' hours')::INTERVAL,
        'alert_message', v_alert_message,
        'trigger_message', p_message
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO PARA VERIFICAR E RETOMAR TIMEOUTS
CREATE OR REPLACE FUNCTION check_and_resume_expired_pauses()
RETURNS JSON AS $$
DECLARE
    v_expired_count INTEGER := 0;
    v_chat RECORD;
    v_result JSON;
BEGIN
    -- Buscar chats com timeout expirado
    FOR v_chat IN 
        SELECT 
            chat_id,
            company_id,
            contact_phone,
            contact_name
        FROM whatsapp_chats 
        WHERE ai_paused = true 
        AND pause_timeout_at < now()
    LOOP
        -- Retomar automaticamente
        UPDATE whatsapp_chats
        SET ai_paused = false,
            pause_timeout_at = null,
            updated_at = now()
        WHERE chat_id = v_chat.chat_id;
        
        -- Log da retomada automática
        INSERT INTO ai_conversation_logs (
            company_id,
            customer_phone,
            customer_name,
            message_content,
            message_type,
            created_at
        ) VALUES (
            v_chat.company_id,
            v_chat.contact_phone,
            v_chat.contact_name,
            '✅ IA RETOMADA AUTOMATICAMENTE após timeout de 1 hora - Cliente: ' || v_chat.contact_name,
            'auto_resume_timeout',
            now()
        );
        
        v_expired_count := v_expired_count + 1;
    END LOOP;
    
    v_result := json_build_object(
        'success', true,
        'resumed_count', v_expired_count,
        'message', 'Verificação de timeout concluída - ' || v_expired_count || ' chat(s) retomado(s)'
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO PARA RETOMAR MANUALMENTE
CREATE OR REPLACE FUNCTION manual_resume_chat(
    p_company_id UUID,
    p_chat_id VARCHAR(255),
    p_resumed_by VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_chat RECORD;
BEGIN
    -- Buscar dados do chat
    SELECT contact_phone, contact_name INTO v_chat
    FROM whatsapp_chats
    WHERE company_id = p_company_id 
    AND chat_id = p_chat_id;
    
    -- Retomar o chat
    UPDATE whatsapp_chats
    SET ai_paused = false,
        pause_timeout_at = null,
        updated_at = now()
    WHERE company_id = p_company_id 
    AND chat_id = p_chat_id;
    
    -- Log da retomada manual
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        p_company_id,
        v_chat.contact_phone,
        v_chat.contact_name,
        '✅ IA RETOMADA MANUALMENTE por: ' || p_resumed_by || ' - Cliente: ' || v_chat.contact_name,
        'manual_resume',
        now()
    );
    
    v_result := json_build_object(
        'success', true,
        'message', 'Chat retomado manualmente com sucesso',
        'chat_id', p_chat_id,
        'customer_name', v_chat.contact_name,
        'resumed_by', p_resumed_by,
        'resumed_at', now()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA BUSCAR CHATS PAUSADOS (para alertas)
CREATE OR REPLACE FUNCTION get_paused_chats_for_alerts(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
    v_paused_chats JSON;
    v_result JSON;
BEGIN
    -- Buscar chats pausados
    SELECT json_agg(
        json_build_object(
            'chat_id', chat_id,
            'contact_name', contact_name,
            'contact_phone', contact_phone,
            'paused_at', updated_at,
            'timeout_at', pause_timeout_at,
            'time_remaining', EXTRACT(EPOCH FROM (pause_timeout_at - now())) / 3600
        )
    )
    INTO v_paused_chats
    FROM whatsapp_chats
    WHERE company_id = p_company_id
    AND ai_paused = true
    ORDER BY updated_at DESC;
    
    v_result := json_build_object(
        'success', true,
        'paused_chats', COALESCE(v_paused_chats, '[]'::json),
        'total_paused', COALESCE(json_array_length(v_paused_chats), 0)
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. TRIGGER PARA VERIFICAÇÃO AUTOMÁTICA DE TIMEOUT
CREATE OR REPLACE FUNCTION trigger_timeout_check()
RETURNS TRIGGER AS $$
BEGIN
    -- Executar verificação de timeout a cada inserção/atualização
    PERFORM check_and_resume_expired_pauses();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger (executa a cada inserção/atualização)
DROP TRIGGER IF EXISTS check_timeout_trigger ON whatsapp_chats;
CREATE TRIGGER check_timeout_trigger
    AFTER INSERT OR UPDATE ON whatsapp_chats
    FOR EACH ROW
    EXECUTE FUNCTION trigger_timeout_check();

-- 8. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_pause_timeout 
ON whatsapp_chats(company_id, ai_paused, pause_timeout_at) 
WHERE ai_paused = true;

CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_pause_status 
ON whatsapp_chats(company_id, ai_paused, updated_at) 
WHERE ai_paused = true;

-- 9. CONFIRMAR CRIAÇÃO
SELECT 'SISTEMA DE PAUSA INTELIGENTE CRIADO COM SUCESSO!' as resultado;
