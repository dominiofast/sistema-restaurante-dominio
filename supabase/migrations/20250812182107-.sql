-- Adicionar política RLS para permitir acesso público aos dados de cashback ativos
CREATE POLICY "Public can view active cashback config" 
ON public.cashback_config 
FOR SELECT 
USING (is_active = true);