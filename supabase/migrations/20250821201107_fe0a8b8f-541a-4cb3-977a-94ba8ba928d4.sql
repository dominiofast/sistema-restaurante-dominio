-- Remover políticas existentes e criar políticas mais permissivas temporárias
DROP POLICY IF EXISTS "Users can view their campaigns" ON public.whatsapp_campaigns;
DROP POLICY IF EXISTS "Users can insert their campaigns" ON public.whatsapp_campaigns;
DROP POLICY IF EXISTS "Users can update their campaigns" ON public.whatsapp_campaigns;
DROP POLICY IF EXISTS "Users can delete their campaigns" ON public.whatsapp_campaigns;

-- Políticas temporárias mais permissivas para usuários autenticados
CREATE POLICY "Authenticated users can view campaigns" 
ON public.whatsapp_campaigns 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert campaigns" 
ON public.whatsapp_campaigns 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update campaigns" 
ON public.whatsapp_campaigns 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete campaigns" 
ON public.whatsapp_campaigns 
FOR DELETE 
USING (auth.uid() IS NOT NULL);