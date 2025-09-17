
-- Criar tabela para informações do estabelecimento
CREATE TABLE public.company_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cnpj_cpf VARCHAR(18),
  razao_social TEXT,
  nome_estabelecimento VARCHAR(255) NOT NULL,
  segmento VARCHAR(100),
  instagram VARCHAR(100),
  contato VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Habilitar RLS
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir operações da empresa
CREATE POLICY "Users can view their company info" 
  ON public.company_info 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their company info" 
  ON public.company_info 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their company info" 
  ON public.company_info 
  FOR UPDATE 
  USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_company_info_updated_at
  BEFORE UPDATE ON public.company_info
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Inserir dados de exemplo para as empresas existentes
INSERT INTO public.company_info (company_id, cnpj_cpf, razao_social, nome_estabelecimento, segmento, instagram, contato)
SELECT 
  id,
  CASE 
    WHEN name = 'Restaurante Bella Vista' THEN '47.275.929/0001-97'
    WHEN name = 'Pizzaria Napoli' THEN '32.186.742/0001-53'
    WHEN name = 'Café Central' THEN '18.394.567/0001-28'
    ELSE NULL
  END,
  CASE 
    WHEN name = 'Restaurante Bella Vista' THEN 'BELLA VISTA RESTAURANTE LTDA'
    WHEN name = 'Pizzaria Napoli' THEN 'NAPOLI PIZZARIA E DELIVERY LTDA'
    WHEN name = 'Café Central' THEN 'CENTRAL CAFETERIA E BISTRO LTDA'
    ELSE name
  END,
  name,
  CASE 
    WHEN name LIKE '%Pizza%' THEN 'Pizzaria'
    WHEN name LIKE '%Restaurante%' THEN 'Restaurante'
    WHEN name LIKE '%Café%' THEN 'Cafeteria'
    ELSE 'Restaurante'
  END,
  CASE 
    WHEN name = 'Restaurante Bella Vista' THEN '@bellavista'
    WHEN name = 'Pizzaria Napoli' THEN '@napolipizzas'
    WHEN name = 'Café Central' THEN '@cafecentral'
    ELSE NULL
  END,
  CASE 
    WHEN name = 'Restaurante Bella Vista' THEN '(69) 3441-4610'
    WHEN name = 'Pizzaria Napoli' THEN '(69) 3225-8847'
    WHEN name = 'Café Central' THEN '(69) 3334-7792'
    ELSE NULL
  END
FROM public.companies
ON CONFLICT (company_id) DO NOTHING;
