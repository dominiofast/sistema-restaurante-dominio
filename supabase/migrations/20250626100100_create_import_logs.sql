-- Tabela para logs de importações de cardápio
CREATE TABLE import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    source_url TEXT,
    items_imported INTEGER,
    status VARCHAR(50), -- ex: 'success', 'failed', 'partial'
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE import_logs IS 'Registra o histórico de importações de cardápio de fontes externas.';
COMMENT ON COLUMN import_logs.company_id IS 'A empresa que realizou a importação.';
COMMENT ON COLUMN import_logs.source_url IS 'A URL de origem dos dados (ex: link do iFood).';
COMMENT ON COLUMN import_logs.items_imported IS 'O número de itens importados com sucesso.';
COMMENT ON COLUMN import_logs.status IS 'O status final da importação.';
COMMENT ON COLUMN import_logs.error_message IS 'Mensagem de erro, caso a importação falhe.';

-- Habilita RLS
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Política: Lojistas podem ver seus próprios logs de importação.
CREATE POLICY "Allow company users to view their own logs"
ON import_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM companies
    WHERE companies.id = import_logs.company_id
      AND companies.user_id = auth.uid()
  )
);

-- Política: Super admins podem ver todos os logs.
CREATE POLICY "Allow super admins to view all logs"
ON import_logs
FOR SELECT
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'); 