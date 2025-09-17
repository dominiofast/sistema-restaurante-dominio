
-- Criar tabela para configurações do agente de IA
CREATE TABLE public.agente_ia_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Configurações básicas
  ativo BOOLEAN NOT NULL DEFAULT true,
  nome VARCHAR(255) NOT NULL DEFAULT 'Atendente Virtual',
  personalidade VARCHAR(50) NOT NULL DEFAULT 'simpatico',
  idioma VARCHAR(10) NOT NULL DEFAULT 'pt-br',
  
  -- Mensagens personalizadas
  mensagem_boas_vindas TEXT,
  mensagem_ausencia TEXT,
  mensagem_despedida TEXT,
  frases_venda TEXT,
  
  -- Configurações de comportamento
  velocidade_resposta INTEGER NOT NULL DEFAULT 2 CHECK (velocidade_resposta >= 1 AND velocidade_resposta <= 5),
  nivel_detalhamento INTEGER NOT NULL DEFAULT 3 CHECK (nivel_detalhamento >= 1 AND nivel_detalhamento <= 5),
  agressividade_venda INTEGER NOT NULL DEFAULT 2 CHECK (agressividade_venda >= 1 AND agressividade_venda <= 5),
  horario_funcionamento VARCHAR(20) NOT NULL DEFAULT '24/7',
  limite_mensagens INTEGER NOT NULL DEFAULT 50,
  
  -- Recursos avançados
  auto_sugestoes BOOLEAN NOT NULL DEFAULT true,
  lembranca_pedidos BOOLEAN NOT NULL DEFAULT true,
  coleta_dados BOOLEAN NOT NULL DEFAULT false,
  integracao_whatsapp BOOLEAN NOT NULL DEFAULT false,
  notificacao_gerente BOOLEAN NOT NULL DEFAULT true,
  
  -- Base de conhecimento
  conhecimento_produtos BOOLEAN NOT NULL DEFAULT true,
  conhecimento_promocoes BOOLEAN NOT NULL DEFAULT true,
  conhecimento_estoque BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.agente_ia_config ENABLE ROW LEVEL SECURITY;

-- Política para que usuários só vejam configurações da sua empresa
CREATE POLICY "Users can view their company's AI agent config" 
  ON public.agente_ia_config 
  FOR SELECT 
  USING (company_id IN (SELECT id FROM public.companies));

-- Política para inserir configurações
CREATE POLICY "Users can create AI agent config for their company" 
  ON public.agente_ia_config 
  FOR INSERT 
  WITH CHECK (company_id IN (SELECT id FROM public.companies));

-- Política para atualizar configurações
CREATE POLICY "Users can update their company's AI agent config" 
  ON public.agente_ia_config 
  FOR UPDATE 
  USING (company_id IN (SELECT id FROM public.companies));

-- Política para deletar configurações
CREATE POLICY "Users can delete their company's AI agent config" 
  ON public.agente_ia_config 
  FOR DELETE 
  USING (company_id IN (SELECT id FROM public.companies));

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_agente_ia_config_updated_at
  BEFORE UPDATE ON public.agente_ia_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para melhorar performance nas consultas por company_id
CREATE INDEX idx_agente_ia_config_company_id ON public.agente_ia_config(company_id);

-- Garantir que cada empresa tenha apenas uma configuração de agente IA
CREATE UNIQUE INDEX idx_agente_ia_config_unique_company ON public.agente_ia_config(company_id);
