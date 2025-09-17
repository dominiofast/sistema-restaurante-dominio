-- Permitir acesso público para leitura da configuração de branding
CREATE POLICY "Allow public read for active branding" ON public.cardapio_branding
FOR SELECT 
TO public
USING (is_active = true);