-- Criar tabela para tipos fiscais (categorias)
CREATE TABLE public.tipos_fiscais (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para dados fiscais dos tipos
CREATE TABLE public.dados_fiscais (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_fiscal_id UUID NOT NULL,
    company_id UUID NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    ean VARCHAR(50),
    codigo_beneficio_fiscal VARCHAR(50),
    ncm VARCHAR(50) NOT NULL,
    origem_mercadoria VARCHAR(10) NOT NULL DEFAULT '0',
    
    -- ICMS
    icms_percentual_base DECIMAL(5,2) DEFAULT 100.00,
    icms_aliquota DECIMAL(5,2) DEFAULT 19.50,
    icms_modalidade_base VARCHAR(50) DEFAULT 'Valor da operação. (v2.0)',
    icms_percentual_fcp DECIMAL(5,2) DEFAULT 2.00,
    
    -- ICMS ST
    icms_st_percentual_base DECIMAL(5,2) DEFAULT 100.00,
    icms_st_aliquota DECIMAL(5,2) DEFAULT 0.00,
    icms_st_modalidade_base VARCHAR(50) DEFAULT 'Pauta (valor)',
    icms_st_mva DECIMAL(5,2) DEFAULT 0.00,
    icms_st_percentual_fcp DECIMAL(5,2) DEFAULT 0.00,
    
    -- ICMS Efetivo
    icms_efetivo_percentual_base DECIMAL(5,2) DEFAULT 100.00,
    icms_efetivo_aliquota DECIMAL(5,2) DEFAULT 19.50,
    
    -- Outros impostos
    aliquota_pis DECIMAL(5,2) DEFAULT 0.00,
    aliquota_cofins DECIMAL(5,2) DEFAULT 0.00,
    aliquota_ipi DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    FOREIGN KEY (tipo_fiscal_id) REFERENCES public.tipos_fiscais(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE public.tipos_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dados_fiscais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tipos_fiscais
CREATE POLICY "Users can manage their company's fiscal types" 
ON public.tipos_fiscais 
FOR ALL 
USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON (u.raw_user_meta_data->>'company_domain' = c.domain) 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

-- Políticas RLS para dados_fiscais
CREATE POLICY "Users can manage their company's fiscal data" 
ON public.dados_fiscais 
FOR ALL 
USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON (u.raw_user_meta_data->>'company_domain' = c.domain) 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

-- Trigger para updated_at
CREATE TRIGGER update_tipos_fiscais_updated_at
    BEFORE UPDATE ON public.tipos_fiscais
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dados_fiscais_updated_at
    BEFORE UPDATE ON public.dados_fiscais
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();