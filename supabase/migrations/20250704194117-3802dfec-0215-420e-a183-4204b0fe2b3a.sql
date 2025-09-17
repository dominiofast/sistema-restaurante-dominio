-- Remover todas as políticas e criar uma bem simples
DROP POLICY IF EXISTS "Allow authenticated users to view nfce logs" ON public.nfce_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert nfce logs" ON public.nfce_logs;
DROP POLICY IF EXISTS "Allow authenticated users to update nfce logs" ON public.nfce_logs;
DROP POLICY IF EXISTS "Super admins have full access to nfce logs" ON public.nfce_logs;

-- Criar política super permissiva para teste
CREATE POLICY "Allow all operations on nfce_logs" 
ON public.nfce_logs 
FOR ALL 
USING (true)
WITH CHECK (true);