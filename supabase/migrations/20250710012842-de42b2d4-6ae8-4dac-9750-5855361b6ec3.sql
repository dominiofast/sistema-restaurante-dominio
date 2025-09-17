-- Criar tabela para configurações de impressoras QZ Tray
CREATE TABLE public.printer_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    printer_name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    impressao_automatica BOOLEAN NOT NULL DEFAULT false,
    largura_papel INTEGER NOT NULL DEFAULT 48,
    texto_header TEXT,
    texto_footer TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Garantir que apenas uma impressora seja padrão por empresa
    CONSTRAINT unique_default_printer_per_company 
        EXCLUDE (company_id WITH =) WHERE (is_default = true)
);

-- Habilitar RLS
ALTER TABLE public.printer_configs ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem gerenciar configurações de sua empresa
CREATE POLICY "Users can manage their company printer configs" 
ON public.printer_configs 
FOR ALL 
USING (
    company_id IN (
        SELECT c.id FROM companies c 
        WHERE c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
    ) 
    OR 
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Criar tabela para logs de impressão QZ Tray
CREATE TABLE public.qz_tray_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    type TEXT NOT NULL CHECK (type IN ('success', 'error', 'info')),
    message TEXT NOT NULL,
    printer_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para logs
ALTER TABLE public.qz_tray_logs ENABLE ROW LEVEL SECURITY;

-- Política RLS para logs
CREATE POLICY "Users can view their company QZ Tray logs" 
ON public.qz_tray_logs 
FOR SELECT 
USING (
    company_id IN (
        SELECT c.id FROM companies c 
        WHERE c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
    ) 
    OR 
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Política para inserção de logs
CREATE POLICY "Users can create QZ Tray logs for their company" 
ON public.qz_tray_logs 
FOR INSERT 
WITH CHECK (
    company_id IN (
        SELECT c.id FROM companies c 
        WHERE c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
    ) 
    OR 
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Criar trigger para atualizar updated_at em printer_configs
CREATE OR REPLACE FUNCTION public.update_printer_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_printer_configs_updated_at
    BEFORE UPDATE ON public.printer_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_printer_configs_updated_at();

-- Adicionar foreign key constraints
ALTER TABLE public.printer_configs 
ADD CONSTRAINT printer_configs_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.qz_tray_logs 
ADD CONSTRAINT qz_tray_logs_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Atualizar política RLS da print_queue para ser mais específica
DROP POLICY IF EXISTS "Users can manage their company print queue" ON public.print_queue;

CREATE POLICY "Users can manage their company print queue" 
ON public.print_queue 
FOR ALL 
USING (
    company_id IN (
        SELECT c.id FROM companies c 
        WHERE c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
    ) 
    OR 
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
) 
WITH CHECK (
    company_id IN (
        SELECT c.id FROM companies c 
        WHERE c.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
    ) 
    OR 
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);