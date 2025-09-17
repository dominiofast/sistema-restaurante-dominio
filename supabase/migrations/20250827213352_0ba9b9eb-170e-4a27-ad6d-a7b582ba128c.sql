-- Criar política mais permissiva para a tabela ai_agent_assistants
DROP POLICY IF EXISTS "Company manage ai_agent_assistants" ON ai_agent_assistants;

CREATE POLICY "Authenticated users can read ai_agent_assistants" 
ON ai_agent_assistants FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ai_agent_assistants" 
ON ai_agent_assistants FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);