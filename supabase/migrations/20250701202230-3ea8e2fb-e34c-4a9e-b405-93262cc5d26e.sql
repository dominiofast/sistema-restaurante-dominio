
-- Criar tabela para credenciais das empresas
CREATE TABLE public.company_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Habilitar RLS
ALTER TABLE public.company_credentials ENABLE ROW LEVEL SECURITY;

-- Política para super admins poderem ver e editar credenciais
CREATE POLICY "Super admins can manage company credentials"
ON public.company_credentials
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'super_admin'
  )
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_company_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_company_credentials_updated_at_trigger
    BEFORE UPDATE ON public.company_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_company_credentials_updated_at();
