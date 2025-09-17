-- Adicionar campos para melhor controle da configuração fiscal
ALTER TABLE company_fiscal_config 
ADD COLUMN IF NOT EXISTS certificado_instalado_focus BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS focus_nfe_habilitado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ultimo_teste_nfce TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status_ultimo_teste TEXT,
ADD COLUMN IF NOT EXISTS observacoes_configuracao TEXT;

-- Atualizar configuração da empresa Domínio Pizzas
UPDATE company_fiscal_config 
SET 
  certificado_instalado_focus = false,
  focus_nfe_habilitado = false,
  status_ultimo_teste = 'certificado_vencido',
  observacoes_configuracao = 'Necessário renovar certificado e habilitar empresa na Focus NFe'
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Criar função para validar configuração fiscal
CREATE OR REPLACE FUNCTION validate_fiscal_config(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
    config RECORD;
    result JSON;
BEGIN
    SELECT * INTO config 
    FROM company_fiscal_config 
    WHERE company_id = p_company_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'valid', false,
            'errors', array['Configuração fiscal não encontrada']
        );
    END IF;
    
    -- Validar campos obrigatórios
    result := json_build_object(
        'valid', true,
        'errors', ARRAY[]::TEXT[],
        'warnings', ARRAY[]::TEXT[],
        'config_status', 'ok'
    );
    
    -- Verificar certificado
    IF config.certificado_validade < NOW() THEN
        result := jsonb_set(
            result::jsonb, 
            '{errors}', 
            (result->'errors')::jsonb || to_jsonb('Certificado vencido'::text)
        );
        result := jsonb_set(result::jsonb, '{valid}', 'false'::jsonb);
    END IF;
    
    -- Verificar token Focus NFe
    IF config.focus_nfe_token IS NULL OR config.focus_nfe_token = '' THEN
        result := jsonb_set(
            result::jsonb, 
            '{errors}', 
            (result->'errors')::jsonb || to_jsonb('Token Focus NFe não configurado'::text)
        );
        result := jsonb_set(result::jsonb, '{valid}', 'false'::jsonb);
    END IF;
    
    -- Verificar se empresa está habilitada
    IF NOT COALESCE(config.focus_nfe_habilitado, false) THEN
        result := jsonb_set(
            result::jsonb, 
            '{warnings}', 
            (result->'warnings')::jsonb || to_jsonb('Empresa não habilitada na Focus NFe'::text)
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;