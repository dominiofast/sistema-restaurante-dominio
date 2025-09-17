
-- Criar tabela de integrações WhatsApp
CREATE TABLE public.whatsapp_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  control_id UUID NOT NULL,
  host TEXT NOT NULL,
  instance_key TEXT NOT NULL,
  token TEXT NOT NULL,
  webhook TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

-- Criar índice único no campo company_id
CREATE UNIQUE INDEX whatsapp_integrations_company_id_idx ON public.whatsapp_integrations(company_id);

-- Habilitar RLS
ALTER TABLE public.whatsapp_integrations ENABLE ROW LEVEL SECURITY;

-- Política para super_admin ver todas as integrações
CREATE POLICY "Super admins can view all whatsapp integrations" 
  ON public.whatsapp_integrations 
  FOR SELECT 
  USING (true);

-- Política para company_admin ver apenas integração da sua empresa
CREATE POLICY "Company admins can view their company whatsapp integration" 
  ON public.whatsapp_integrations 
  FOR SELECT 
  USING (company_id IN (SELECT id FROM public.companies));

-- Política para super_admin criar integrações
CREATE POLICY "Super admins can create whatsapp integrations" 
  ON public.whatsapp_integrations 
  FOR INSERT 
  WITH CHECK (true);

-- Política para company_admin criar integração para sua empresa
CREATE POLICY "Company admins can create whatsapp integration for their company" 
  ON public.whatsapp_integrations 
  FOR INSERT 
  WITH CHECK (company_id IN (SELECT id FROM public.companies));

-- Política para super_admin atualizar integrações
CREATE POLICY "Super admins can update whatsapp integrations" 
  ON public.whatsapp_integrations 
  FOR UPDATE 
  USING (true);

-- Política para company_admin atualizar apenas integração da sua empresa
CREATE POLICY "Company admins can update their company whatsapp integration" 
  ON public.whatsapp_integrations 
  FOR UPDATE 
  USING (company_id IN (SELECT id FROM public.companies));

-- Política para super_admin deletar integrações
CREATE POLICY "Super admins can delete whatsapp integrations" 
  ON public.whatsapp_integrations 
  FOR DELETE 
  USING (true);

-- Política para company_admin deletar apenas integração da sua empresa
CREATE POLICY "Company admins can delete their company whatsapp integration" 
  ON public.whatsapp_integrations 
  FOR DELETE 
  USING (company_id IN (SELECT id FROM public.companies));
