-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their company NFCe logs" ON public.nfce_logs;
DROP POLICY IF EXISTS "Users can create NFCe logs for their company" ON public.nfce_logs;  
DROP POLICY IF EXISTS "Users can update their company NFCe logs" ON public.nfce_logs;
DROP POLICY IF EXISTS "Users can access their company nfce logs" ON public.nfce_logs;

-- Criar políticas mais permissivas e corretas
CREATE POLICY "Allow authenticated users to view nfce logs" 
ON public.nfce_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert nfce logs" 
ON public.nfce_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update nfce logs" 
ON public.nfce_logs 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Política para super admins
CREATE POLICY "Super admins have full access to nfce logs" 
ON public.nfce_logs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND (users.raw_user_meta_data ->> 'role') = 'super_admin'
  )
);