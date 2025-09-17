-- Ajustar políticas RLS para permitir acesso de usuários autenticados

-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "owner can edit" ON public.ai_agent_prompts;
DROP POLICY IF EXISTS "owner can view history" ON public.ai_prompt_history;

-- Criar políticas mais permissivas para usuários autenticados
CREATE POLICY "authenticated users can manage prompts" ON public.ai_agent_prompts
  FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated users can view history" ON public.ai_prompt_history
  FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Atualizar trigger para definir owner_id automaticamente
CREATE OR REPLACE FUNCTION public.save_prompt_to_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Salvar versão anterior no histórico
    IF OLD IS NOT NULL THEN
        INSERT INTO public.ai_prompt_history (agent_id, template, vars, version, owner_id, updated_at)
        VALUES (OLD.id, OLD.template, OLD.vars, OLD.version, OLD.owner_id, OLD.updated_at);
    END IF;
    
    -- Incrementar versão do novo registro
    NEW.version = COALESCE(OLD.version, 0) + 1;
    NEW.updated_at = now();
    
    -- Definir owner_id automaticamente se não estiver definido
    IF NEW.owner_id IS NULL THEN
        NEW.owner_id = auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;