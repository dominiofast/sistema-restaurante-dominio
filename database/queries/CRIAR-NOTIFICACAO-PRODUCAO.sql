-- CRIAR NOTIFICACAO QUANDO PEDIDO VAI PARA PRODUCAO
-- Trigger executado quando status muda de "analise" para "producao"

-- Criar funcao para notificar producao
CREATE OR REPLACE FUNCTION notify_production_status()
RETURNS TRIGGER AS $$
DECLARE
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_company_name TEXT;
BEGIN
    -- Verificar se mudou de "analise" para "producao"
    IF OLD.status = 'analise' AND NEW.status = 'producao' THEN
        
        -- Buscar integracao WhatsApp
        SELECT * INTO v_whatsapp_integration
        FROM whatsapp_integrations 
        WHERE company_id = NEW.company_id 
        AND is_active = true
        LIMIT 1;
        
        -- Se nao encontrar integracao, sair
        IF NOT FOUND THEN
            RETURN NEW;
        END IF;
        
        -- Buscar nome da empresa
        SELECT name INTO v_company_name
        FROM companies 
        WHERE id = NEW.company_id;
        
        -- Montar mensagem
        v_message_text := 
            '🍕 *PEDIDO EM PRODUÇÃO* 🥳' || E'\n\n' ||
            '✅ Ótimas notícias! Seu pedido já está sendo preparado!' || E'\n\n' ||
            '📋 *Pedido n°* ' || NEW.numero_pedido || E'\n' ||
            '👤 *Cliente:* ' || NEW.nome_cliente || E'\n' ||
            '⏰ *Status:* Em produção' || E'\n\n' ||
            '🔥 Nossa equipe está preparando seu pedido com muito carinho!' || E'\n' ||
            '📱 Você receberá uma nova notificação quando estiver pronto.' || E'\n\n' ||
            '🏪 *' || COALESCE(v_company_name, 'Estabelecimento') || '*' || E'\n' ||
            '🙏 Obrigado pela sua paciência!';
        
        -- Enviar mensagem via WhatsApp
        SELECT content INTO v_api_response
        FROM http((
            'POST',
            'https://apinocode01.megaapi.com.br/rest/sendMessage/' || v_whatsapp_integration.instance_key || '/text',
            ARRAY[
                http_header('Authorization', 'Bearer ' || v_whatsapp_integration.token),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'messageData', json_build_object(
                    'to', NEW.telefone,
                    'text', v_message_text
                )
            )::text
        ));
        
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, apenas retorna NEW sem interromper o processo
        RAISE NOTICE 'Erro ao enviar notificacao de producao: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para mudanca de status
DROP TRIGGER IF EXISTS trigger_notify_production ON pedidos;
CREATE TRIGGER trigger_notify_production
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_production_status();

-- Verificar se foi criado
SELECT 'Sistema de notificacao de producao criado com sucesso!' as status;
