-- Criar tabela nfce_logs se não existir
CREATE TABLE IF NOT EXISTS public.nfce_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    pedido_id INTEGER,
    referencia TEXT,
    chave_nfe VARCHAR,
    numero_nfce INTEGER,
    serie INTEGER,
    status VARCHAR DEFAULT 'processando',
    url_danfe TEXT,
    protocolo_autorizacao TEXT,
    data_autorizacao TIMESTAMP WITH TIME ZONE,
    xml_nfce TEXT,
    motivo_cancelamento TEXT,
    justificativa_cancelamento TEXT,
    error_message TEXT,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.nfce_logs ENABLE ROW LEVEL SECURITY;

-- Remover política existente se houver
DROP POLICY IF EXISTS "Users can access their company nfce logs" ON public.nfce_logs;

-- Criar política para permitir operações da empresa
CREATE POLICY "Users can access their company nfce logs" 
ON public.nfce_logs 
FOR ALL 
USING (
    company_id IN (
        SELECT c.id 
        FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) 
    OR EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'super_admin'
    )
);