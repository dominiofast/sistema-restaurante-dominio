-- Criar tabela company_settings para configurações da empresa
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  printer_ip TEXT,
  printer_port INTEGER DEFAULT 9100,
  printer_name TEXT,
  printer_type TEXT DEFAULT 'network' CHECK (printer_type IN ('network', 'dominio', 'qz_tray')),
  dominio_printer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id)
);

-- Habilitar RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their company settings" 
ON public.company_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = company_settings.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their company settings" 
ON public.company_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = company_settings.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their company settings" 
ON public.company_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = company_settings.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their company settings" 
ON public.company_settings 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = company_settings.company_id 
    AND companies.user_id = auth.uid()
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();