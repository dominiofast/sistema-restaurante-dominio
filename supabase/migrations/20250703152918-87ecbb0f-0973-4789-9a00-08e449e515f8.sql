-- Adicionar coluna company_id à tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Atualizar registros existentes para associar à primeira empresa (temporário)
UPDATE public.clientes 
SET company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE company_id IS NULL;

-- Tornar a coluna obrigatória
ALTER TABLE public.clientes 
ALTER COLUMN company_id SET NOT NULL;

-- Remover políticas RLS antigas
DROP POLICY IF EXISTS "Users can view company clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clientes;

-- Criar novas políticas RLS para isolar por empresa
CREATE POLICY "Users can view their company clients" 
ON public.clientes FOR SELECT 
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

CREATE POLICY "Users can create clients for their company" 
ON public.clientes FOR INSERT 
WITH CHECK (
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

CREATE POLICY "Users can update their company clients" 
ON public.clientes FOR UPDATE 
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

CREATE POLICY "Users can delete their company clients" 
ON public.clientes FOR DELETE 
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

-- Criar índice para performance
CREATE INDEX idx_clientes_company_id ON public.clientes(company_id);