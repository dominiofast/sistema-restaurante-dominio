
-- Criar tabela para configurações gerais de horário por empresa
CREATE TABLE public.horario_funcionamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  fuso_horario VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
  tipo_disponibilidade VARCHAR(20) NOT NULL DEFAULT 'especificos',
  -- tipos: 'sempre', 'especificos', 'agendados', 'fechado'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id)
);

-- Criar tabela para horários específicos por dia da semana
CREATE TABLE public.horarios_dias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  horario_funcionamento_id UUID NOT NULL REFERENCES horario_funcionamento(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL, -- 0=domingo, 1=segunda, etc
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_horario_funcionamento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_horario_funcionamento_updated_at
    BEFORE UPDATE ON public.horario_funcionamento
    FOR EACH ROW
    EXECUTE PROCEDURE update_horario_funcionamento_updated_at();

-- Habilitar RLS
ALTER TABLE public.horario_funcionamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_dias ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (temporariamente permissivas - ajustar conforme autenticação)
CREATE POLICY "Allow all operations on horario_funcionamento" ON public.horario_funcionamento
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on horarios_dias" ON public.horarios_dias  
FOR ALL USING (true) WITH CHECK (true);
