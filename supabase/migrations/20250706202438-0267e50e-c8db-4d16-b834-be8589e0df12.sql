-- Criar tabela para configurações de impressão térmica
CREATE TABLE IF NOT EXISTS public.print_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  printer_name TEXT,
  paper_width INTEGER DEFAULT 48,
  print_copies INTEGER DEFAULT 1,
  auto_print_orders BOOLEAN DEFAULT true,
  auto_print_nfce BOOLEAN DEFAULT false,
  header_text TEXT,
  footer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.print_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their company print configs" 
  ON public.print_configs 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT c.id FROM companies c 
      WHERE (
        -- Super admin pode ver todas
        ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
        -- Admin da empresa pode ver as suas
        (c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'))
      )
    )
  );

CREATE POLICY "Users can insert their company print configs" 
  ON public.print_configs 
  FOR INSERT 
  WITH CHECK (
    company_id IN (
      SELECT c.id FROM companies c 
      WHERE (
        ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
        (c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'))
      )
    )
  );

CREATE POLICY "Users can update their company print configs" 
  ON public.print_configs 
  FOR UPDATE 
  USING (
    company_id IN (
      SELECT c.id FROM companies c 
      WHERE (
        ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
        (c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'))
      )
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_print_configs_updated_at
  BEFORE UPDATE ON public.print_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_print_configs_updated_at();