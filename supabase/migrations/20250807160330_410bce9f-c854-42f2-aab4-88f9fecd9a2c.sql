-- Criar tabela fonte de verdade para prompts de IA
CREATE TABLE public.ai_agent_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug TEXT UNIQUE NOT NULL,
  template TEXT NOT NULL,          -- Prompt com placeholders Mustache
  vars JSONB DEFAULT '{}',         -- Variáveis padrão
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de histórico para rollback/auditoria
CREATE TABLE public.ai_prompt_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agent_id UUID REFERENCES public.ai_agent_prompts(id) ON DELETE CASCADE,
  template TEXT,
  vars JSONB,
  version INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.ai_agent_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ai_agent_prompts
CREATE POLICY "Allow all operations on ai_agent_prompts" 
ON public.ai_agent_prompts 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Políticas RLS para ai_prompt_history
CREATE POLICY "Allow all operations on ai_prompt_history" 
ON public.ai_prompt_history 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Trigger para automaticamente salvar no histórico quando o prompt for atualizado
CREATE OR REPLACE FUNCTION public.save_prompt_to_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Salvar versão anterior no histórico
    IF OLD IS NOT NULL THEN
        INSERT INTO public.ai_prompt_history (agent_id, template, vars, version, updated_at)
        VALUES (OLD.id, OLD.template, OLD.vars, OLD.version, OLD.updated_at);
    END IF;
    
    -- Incrementar versão do novo registro
    NEW.version = COALESCE(OLD.version, 0) + 1;
    NEW.updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para execução automática
CREATE TRIGGER trigger_save_prompt_history
    BEFORE UPDATE ON public.ai_agent_prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.save_prompt_to_history();

-- Inserir prompt inicial para o agente existente
INSERT INTO public.ai_agent_prompts (agent_slug, template, vars) 
VALUES (
    'agente-ia-conversa',
    'Você é um assistente virtual inteligente e especializado.

🎯 COMPORTAMENTO OBRIGATÓRIO:
1. SEMPRE inclua o link do cardápio na primeira interação
2. Use o formato: https://pedido.dominio.tech/{{company_slug}}
3. Seja acolhedor e ofereça o cardápio como primeira opção
4. NUNCA repita mensagens - evolua sempre a conversa
5. Após enviar cardápio, aguarde ação do cliente

📋 FLUXO PADRÃO:
• Saudação + Nome do assistente + Cardápio + Opções
• Para dúvidas: responda e direcione ao cardápio
• Para pedidos: reforce o cardápio e encerre
• SEMPRE finalize com o link do cardápio

✨ PERSONALIDADE:
- {{personality}}
- Direto ao ponto
- Focado em conversão
- Linguagem natural do Brasil

🤖 ASSISTENTE: {{agent_name}}
🍽️ CONHECIMENTO: {{menu_data}}
💬 FRASES DE VENDA: {{sales_phrases}}',
    '{
        "company_slug": "test",
        "personality": "Caloroso e acolhedor",
        "agent_name": "Atendente Virtual",
        "menu_data": "Cardápio disponível no link",
        "sales_phrases": "Confira nossos destaques! Posso te sugerir algo especial?"
    }'
) ON CONFLICT (agent_slug) DO NOTHING;