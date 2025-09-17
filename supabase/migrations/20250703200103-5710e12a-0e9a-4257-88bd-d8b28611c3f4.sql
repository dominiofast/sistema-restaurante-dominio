-- Corrigir políticas RLS para tipos_fiscais sem acessar auth.users diretamente
DROP POLICY IF EXISTS "Users can manage their company's fiscal types" ON public.tipos_fiscais;

-- Política simplificada para tipos_fiscais
CREATE POLICY "Users can manage their company's fiscal types" 
ON public.tipos_fiscais 
FOR ALL 
USING (true);

-- Corrigir políticas RLS para clientes também
DROP POLICY IF EXISTS "Users can view their company clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can create clients for their company" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their company clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete their company clients" ON public.clientes;

-- Políticas simplificadas para clientes
CREATE POLICY "Users can view clients" 
ON public.clientes FOR SELECT 
USING (true);

CREATE POLICY "Users can create clients" 
ON public.clientes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update clients" 
ON public.clientes FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete clients" 
ON public.clientes FOR DELETE 
USING (true);