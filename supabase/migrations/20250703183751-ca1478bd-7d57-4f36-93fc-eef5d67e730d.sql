
-- Adicionar campos faltantes na configuração fiscal
ALTER TABLE company_fiscal_config 
ADD COLUMN IF NOT EXISTS razao_social text,
ADD COLUMN IF NOT EXISTS nome_fantasia text,
ADD COLUMN IF NOT EXISTS logradouro text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS uf text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS telefone text,
ADD COLUMN IF NOT EXISTS ie_substituicao_tributaria text,
ADD COLUMN IF NOT EXISTS codigo_regime_tributario text,
ADD COLUMN IF NOT EXISTS natureza_operacao text DEFAULT 'Venda',
ADD COLUMN IF NOT EXISTS finalidade_emissao text DEFAULT '1',
ADD COLUMN IF NOT EXISTS presenca_comprador text DEFAULT '1',
ADD COLUMN IF NOT EXISTS consumidor_final boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS indicador_ie_destinatario text DEFAULT '9';

-- Adicionar campos para melhor controle de produtos
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS cfop text DEFAULT '5102',
ADD COLUMN IF NOT EXISTS cst_csosn text DEFAULT '102',
ADD COLUMN IF NOT EXISTS aliquota_icms numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS origem_produto text DEFAULT '0',
ADD COLUMN IF NOT EXISTS situacao_tributaria text DEFAULT '102';

-- Adicionar campos para melhor controle de NFCe
ALTER TABLE nfce_logs
ADD COLUMN IF NOT EXISTS referencia text,
ADD COLUMN IF NOT EXISTS protocolo_autorizacao text,
ADD COLUMN IF NOT EXISTS data_autorizacao timestamp with time zone,
ADD COLUMN IF NOT EXISTS motivo_cancelamento text,
ADD COLUMN IF NOT EXISTS justificativa_cancelamento text;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_nfce_logs_company_id ON nfce_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_nfce_logs_chave_nfe ON nfce_logs(chave_nfe);
CREATE INDEX IF NOT EXISTS idx_company_fiscal_config_company_id ON company_fiscal_config(company_id);
