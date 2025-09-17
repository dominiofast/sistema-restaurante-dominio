-- Política específica para permitir inserção via service role (edge functions)
CREATE POLICY "Allow service role insert user companies" 
ON user_companies 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Política para inserção via functions authenticated
CREATE POLICY "Allow authenticated insert user companies" 
ON user_companies 
FOR INSERT 
TO authenticated
WITH CHECK (true);