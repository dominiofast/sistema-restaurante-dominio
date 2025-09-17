
-- Habilitar RLS na tabela regioes_atendimento
ALTER TABLE public.regioes_atendimento ENABLE ROW LEVEL SECURITY;

-- Política para visualizar regiões (usuários podem ver regiões de suas empresas)
CREATE POLICY "Users can view their company regions" ON public.regioes_atendimento
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = regioes_atendimento.company_id
        )
    );

-- Política para inserir regiões (usuários podem inserir regiões para suas empresas)
CREATE POLICY "Users can insert their company regions" ON public.regioes_atendimento
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = regioes_atendimento.company_id
        )
    );

-- Política para atualizar regiões (usuários podem atualizar regiões de suas empresas)
CREATE POLICY "Users can update their company regions" ON public.regioes_atendimento
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = regioes_atendimento.company_id
        )
    );

-- Política para deletar regiões (usuários podem deletar regiões de suas empresas)
CREATE POLICY "Users can delete their company regions" ON public.regioes_atendimento
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = regioes_atendimento.company_id
        )
    );

-- Dar permissões à tabela para usuários autenticados
GRANT ALL ON public.regioes_atendimento TO authenticated;
GRANT SELECT ON public.regioes_atendimento TO anon;
