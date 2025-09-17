-- Criar tabela para armazenar logs de NFCe geradas
CREATE TABLE public.nfce_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  pedido_id INTEGER NOT NULL,
  chave_nfce TEXT,
  numero_nfce TEXT,
  serie TEXT DEFAULT '1',
  url_danfe TEXT,
  protocolo_autorizacao TEXT,
  data_autorizacao TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'autorizada',
  valor_total NUMERIC(10,2),
  ref TEXT,
  mensagem_sefaz TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payload_focus_nfe JSONB,
  response_focus_nfe JSONB
);

-- Habilitar RLS
ALTER TABLE public.nfce_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view their company NFCe logs" 
ON public.nfce_logs 
FOR SELECT 
USING (
  company_id IN (
    SELECT c.id FROM companies c 
    WHERE (
      (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain') = c.domain OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
    )
  )
);

CREATE POLICY "Users can create NFCe logs for their company" 
ON public.nfce_logs 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT c.id FROM companies c 
    WHERE (
      (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain') = c.domain OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
    )
  )
);

CREATE POLICY "Users can update their company NFCe logs" 
ON public.nfce_logs 
FOR UPDATE 
USING (
  company_id IN (
    SELECT c.id FROM companies c 
    WHERE (
      (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain') = c.domain OR
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
    )
  )
);

-- Índices para melhor performance
CREATE INDEX idx_nfce_logs_company_pedido ON public.nfce_logs(company_id, pedido_id);
CREATE INDEX idx_nfce_logs_created_at ON public.nfce_logs(created_at DESC);