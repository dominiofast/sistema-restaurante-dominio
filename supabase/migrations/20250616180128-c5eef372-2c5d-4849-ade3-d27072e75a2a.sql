
-- Criar tabela de empresas
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  logo TEXT,
  plan TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  user_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Política para super_admin ver todas as empresas
CREATE POLICY "Super admins can view all companies" 
  ON public.companies 
  FOR SELECT 
  USING (true);

-- Política para super_admin criar empresas
CREATE POLICY "Super admins can create companies" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (true);

-- Política para super_admin atualizar empresas
CREATE POLICY "Super admins can update companies" 
  ON public.companies 
  FOR UPDATE 
  USING (true);

-- Política para super_admin deletar empresas
CREATE POLICY "Super admins can delete companies" 
  ON public.companies 
  FOR DELETE 
  USING (true);

-- Inserir dados de exemplo
INSERT INTO public.companies (name, domain, logo, plan, status, user_count) VALUES
('Restaurante Bella Vista', 'bellavista', '🍽️', 'pro', 'active', 12),
('Pizzaria Napoli', 'napoli', '🍕', 'basic', 'active', 5),
('Café Central', 'cafecentral', '☕', 'enterprise', 'active', 25);
