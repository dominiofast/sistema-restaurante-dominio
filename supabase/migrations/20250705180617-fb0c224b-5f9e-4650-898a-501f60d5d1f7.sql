-- Criar tabela para configurações de impressão térmica
CREATE TABLE IF NOT EXISTS public.print_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  auto_print_orders BOOLEAN NOT NULL DEFAULT false,
  auto_print_nfce BOOLEAN NOT NULL DEFAULT false,
  printer_name TEXT,
  print_copies INTEGER NOT NULL DEFAULT 1,
  paper_width INTEGER NOT NULL DEFAULT 48,
  header_text TEXT,
  footer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT print_configs_company_id_unique UNIQUE (company_id)
);

-- Habilitar RLS
ALTER TABLE public.print_configs ENABLE ROW LEVEL SECURITY;

-- Política para visualizar configurações da própria empresa
CREATE POLICY "Users can view their company print configs" 
ON public.print_configs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Política para inserir configurações da própria empresa
CREATE POLICY "Users can create their company print configs" 
ON public.print_configs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Política para atualizar configurações da própria empresa
CREATE POLICY "Users can update their company print configs" 
ON public.print_configs 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Política para deletar configurações da própria empresa
CREATE POLICY "Users can delete their company print configs" 
ON public.print_configs 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_print_configs_updated_at
BEFORE UPDATE ON public.print_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_print_configs_updated_at();