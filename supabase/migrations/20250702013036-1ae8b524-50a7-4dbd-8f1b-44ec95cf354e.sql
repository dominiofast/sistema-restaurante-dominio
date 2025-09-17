-- Permitir consulta pública para verificação de login de empresas
CREATE POLICY "Allow public to read company credentials for login"
ON public.company_credentials
FOR SELECT
TO anon
USING (true);