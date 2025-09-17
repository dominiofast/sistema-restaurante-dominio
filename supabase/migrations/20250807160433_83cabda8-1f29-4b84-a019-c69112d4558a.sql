-- Adicionar coluna owner_id nas tabelas
ALTER TABLE public.ai_agent_prompts 
ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.ai_prompt_history 
ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Remover policies antigas
DROP POLICY IF EXISTS "Allow all operations on ai_agent_prompts" ON public.ai_agent_prompts;
DROP POLICY IF EXISTS "Allow all operations on ai_prompt_history" ON public.ai_prompt_history;

-- Cada usuário só edita seus próprios agentes
CREATE POLICY "owner can edit" ON public.ai_agent_prompts
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy para histórico - usuários podem ver/inserir histórico de seus próprios prompts
CREATE POLICY "owner can view history" ON public.ai_prompt_history
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Permitir leitura pública dos prompts para execução (edge functions)
CREATE POLICY "public read for execution" ON public.ai_agent_prompts
  FOR SELECT USING (true);

-- Atualizar trigger para incluir owner_id no histórico
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
    
    -- Se não tem owner_id definido, usar o usuário atual
    IF NEW.owner_id IS NULL THEN
        NEW.owner_id = auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar registro existente com um owner_id padrão (super admin ou primeiro usuário)
UPDATE public.ai_agent_prompts 
SET owner_id = (SELECT id FROM auth.users LIMIT 1)
WHERE owner_id IS NULL;