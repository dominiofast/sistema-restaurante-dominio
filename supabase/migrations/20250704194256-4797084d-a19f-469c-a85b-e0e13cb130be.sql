-- Reabilitar RLS
ALTER TABLE public.nfce_logs ENABLE ROW LEVEL SECURITY;

-- Remover dados de teste
DELETE FROM public.nfce_logs WHERE pedido_id = 998;

-- Criar políticas que funcionam baseadas nas que já existem e funcionam no sistema
CREATE POLICY "Enable all operations for authenticated users" 
ON public.nfce_logs 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);