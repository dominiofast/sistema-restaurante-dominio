-- Criar tabela para programas/aplicações da Saipos
CREATE TABLE public.programas_saipos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  url_download text,
  versao text,
  icone text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Comentários para documentação
COMMENT ON TABLE public.programas_saipos IS 'Tabela para gerenciar os programas e aplicações da Saipos';
COMMENT ON COLUMN public.programas_saipos.nome IS 'Nome do programa/aplicação';
COMMENT ON COLUMN public.programas_saipos.descricao IS 'Descrição do programa';
COMMENT ON COLUMN public.programas_saipos.url_download IS 'URL para download do programa';
COMMENT ON COLUMN public.programas_saipos.versao IS 'Versão atual do programa';
COMMENT ON COLUMN public.programas_saipos.icone IS 'URL do ícone do programa';
COMMENT ON COLUMN public.programas_saipos.ativo IS 'Se o programa está ativo/disponível';

-- Habilitar RLS
ALTER TABLE public.programas_saipos ENABLE ROW LEVEL SECURITY;

-- Política para super admins gerenciarem os programas
CREATE POLICY "Super admins can manage programas_saipos"
ON public.programas_saipos
FOR ALL
USING (
  (auth.jwt() ->> 'role') = 'super_admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin' OR
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
)
WITH CHECK (
  (auth.jwt() ->> 'role') = 'super_admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin' OR
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.update_programas_saipos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente o updated_at
CREATE TRIGGER update_programas_saipos_updated_at
    BEFORE UPDATE ON public.programas_saipos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_programas_saipos_updated_at();

-- Inserir alguns programas exemplo
INSERT INTO public.programas_saipos (nome, descricao, versao) VALUES
('Saipos Printer', 'Sistema de impressão térmica para pedidos', '1.0.0'),
('Saipos Sync', 'Sincronização de dados entre sistemas', '2.1.0'),
('Saipos SAT', 'Integração com equipamentos SAT fiscal', '1.5.2'),
('Saipos Fiscal', 'Emissão de notas fiscais eletrônicas', '3.0.1'),
('Saipos Balança', 'Integração com balanças digitais', '1.2.0'),
('Saipos TEF (PayGo)', 'Terminal de pagamento eletrônico', '2.0.3'),
('MongoDB', 'Banco de dados NoSQL para relatórios', '5.0'),
('Suporte 1 (Any Desk)', 'Acesso remoto para suporte técnico', '7.0.14'),
('Suporte 2 (Team Viewer)', 'Alternativa para acesso remoto', '15.0');