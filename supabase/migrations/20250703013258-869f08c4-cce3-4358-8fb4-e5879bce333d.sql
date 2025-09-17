-- Criar tabela para configurações fiscais da empresa
CREATE TABLE public.company_fiscal_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Dados fiscais básicos
  cnpj VARCHAR(18) NOT NULL,
  inscricao_estadual VARCHAR(20),
  regime_tributario VARCHAR(20) DEFAULT 'simples_nacional',
  
  -- Certificado digital
  certificado_status VARCHAR(20) DEFAULT 'ativo',
  certificado_validade DATE,
  certificado_senha TEXT,
  
  -- Focus NFe configuração
  focus_nfe_token TEXT,
  focus_nfe_ambiente VARCHAR(20) DEFAULT 'homologacao', -- homologacao ou producao
  
  -- NFCe configurações
  nfce_serie INTEGER DEFAULT 1,
  nfce_proxima_numeracao INTEGER DEFAULT 1,
  nfce_token TEXT,
  nfce_id_token VARCHAR(10),
  
  -- NFe configurações (modelo 55)
  nfe_serie INTEGER DEFAULT 1,
  nfe_proxima_numeracao INTEGER DEFAULT 1,
  
  -- Informações adicionais
  informacao_complementar_nfce TEXT,
  email_xmls TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.company_fiscal_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their company fiscal config" 
  ON public.company_fiscal_config 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT c.id FROM companies c
      JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
      WHERE u.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'super_admin'
    )
  );

CREATE POLICY "Users can create their company fiscal config" 
  ON public.company_fiscal_config 
  FOR INSERT 
  WITH CHECK (
    company_id IN (
      SELECT c.id FROM companies c
      JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
      WHERE u.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'super_admin'
    )
  );

CREATE POLICY "Users can update their company fiscal config" 
  ON public.company_fiscal_config 
  FOR UPDATE 
  USING (
    company_id IN (
      SELECT c.id FROM companies c
      JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
      WHERE u.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_company_fiscal_config_updated_at
  BEFORE UPDATE ON public.company_fiscal_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para logs de NFCe geradas
CREATE TABLE public.nfce_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  pedido_id INTEGER,
  chave_nfe VARCHAR(44),
  numero_nfce INTEGER,
  serie INTEGER,
  status VARCHAR(20) DEFAULT 'processando',
  url_danfe TEXT,
  xml_nfce TEXT,
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS para nfce_logs
ALTER TABLE public.nfce_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their company nfce logs" 
  ON public.nfce_logs 
  FOR ALL
  USING (
    company_id IN (
      SELECT c.id FROM companies c
      JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
      WHERE u.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Trigger para nfce_logs
CREATE TRIGGER update_nfce_logs_updated_at
  BEFORE UPDATE ON public.nfce_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();