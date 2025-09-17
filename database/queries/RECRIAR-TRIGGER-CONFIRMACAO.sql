-- RECRIAR TRIGGER DE CONFIRMACAO
-- A funcao send_whatsapp_notification_after_items ja existe, so precisa do trigger

-- Remover triggers antigos
DROP TRIGGER IF EXISTS trigger_confirmacao_limpa_final ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_whatsapp_notification_after_items ON pedido_itens;
DROP TRIGGER IF EXISTS trigger_confirmacao_nova ON pedido_itens;

-- Criar trigger usando a funcao existente
CREATE TRIGGER trigger_whatsapp_confirmation
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- Verificar se o trigger foi criado
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    'TRIGGER CRIADO COM SUCESSO!' as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND t.tgname = 'trigger_whatsapp_confirmation'
AND NOT t.tgisinternal;
