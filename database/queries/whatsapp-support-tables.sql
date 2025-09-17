-- TABELAS DE SUPORTE PARA SISTEMA DE NOTIFICAÇÕES WHATSAPP
-- Estas tabelas são necessárias para o funcionamento da função de trigger otimizada

-- Tabela para queue de notificações assíncronas (fallback)
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'whatsapp_order_confirmation',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT notification_queue_status_check 
        CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'retry')),
    CONSTRAINT notification_queue_type_check 
        CHECK (type IN ('whatsapp_order_confirmation', 'whatsapp_status_update')),
    CONSTRAINT notification_queue_retry_count_check 
        CHECK (retry_count >= 0 AND retry_count <= max_retries)
);

-- Tabela para logs detalhados de notificações
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT notification_logs_status_check 
        CHECK (status IN ('success', 'failed', 'retry', 'pending')),
    CONSTRAINT notification_logs_type_check 
        CHECK (type IN ('whatsapp_trigger', 'whatsapp_async', 'whatsapp_retry', 'whatsapp_manual'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_status_created 
    ON notification_queue (status, created_at);

CREATE INDEX IF NOT EXISTS idx_notification_queue_pedido_id 
    ON notification_queue (pedido_id);

CREATE INDEX IF NOT EXISTS idx_notification_queue_next_retry 
    ON notification_queue (next_retry_at) 
    WHERE status = 'retry' AND next_retry_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_logs_pedido_id 
    ON notification_logs (pedido_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at 
    ON notification_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_type_status 
    ON notification_logs (type, status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notification_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_notification_queue_updated_at ON notification_queue;
CREATE TRIGGER trigger_update_notification_queue_updated_at
    BEFORE UPDATE ON notification_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_queue_updated_at();

-- Função para limpeza automática de logs antigos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_notification_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Remove logs com mais de 30 dias
    DELETE FROM notification_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Limpeza de logs: % registros removidos', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Verificar se as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    'TABELA CRIADA' as status
FROM pg_tables 
WHERE tablename IN ('notification_queue', 'notification_logs')
ORDER BY tablename;

-- Verificar índices criados
SELECT 
    indexname,
    tablename,
    'ÍNDICE CRIADO' as status
FROM pg_indexes 
WHERE tablename IN ('notification_queue', 'notification_logs')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Informações sobre as tabelas criadas
SELECT '📋 TABELAS DE SUPORTE CRIADAS:' as info;
SELECT '• notification_queue - Para processamento assíncrono' as tabela_1;
SELECT '• notification_logs - Para auditoria e debugging' as tabela_2;
SELECT '• Índices otimizados para performance' as feature_1;
SELECT '• Trigger para updated_at automático' as feature_2;
SELECT '• Função de limpeza de logs antigos' as feature_3;