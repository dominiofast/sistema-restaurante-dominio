
-- Habilitar RLS na tabela ai_global_config
ALTER TABLE public.ai_global_config ENABLE ROW LEVEL SECURITY;

-- Política para permitir que super admins vejam a configuração global
CREATE POLICY "Super admins can view global AI config" 
  ON public.ai_global_config 
  FOR SELECT 
  USING (true);

-- Política para permitir que super admins insiram configuração global
CREATE POLICY "Super admins can create global AI config" 
  ON public.ai_global_config 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir que super admins atualizem a configuração global
CREATE POLICY "Super admins can update global AI config" 
  ON public.ai_global_config 
  FOR UPDATE 
  USING (true);

-- Política para permitir que super admins deletem a configuração global
CREATE POLICY "Super admins can delete global AI config" 
  ON public.ai_global_config 
  FOR DELETE 
  USING (true);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_ai_global_config_active ON public.ai_global_config(is_active);
