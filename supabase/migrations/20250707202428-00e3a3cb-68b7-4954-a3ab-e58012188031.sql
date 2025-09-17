-- Adicionar política para permitir que todos os usuários autenticados vejam configurações do iFood App
CREATE POLICY "Authenticated users can view ifood app config"
ON ifood_app_config
FOR SELECT
TO authenticated
USING (true);