import { CompanyFiscalConfig } from './useCompanyFiscalConfig';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function useCompanyFiscalValidation() {
  const validarConfiguracao = (fiscalConfig: CompanyFiscalConfig | null): ValidationResult => {
    if (!fiscalConfig) return { valid: false, errors: ['Configuração não encontrada'] };
    
    const errors: string[] = [];
    
    // Validações obrigatórias
    if (!fiscalConfig.cnpj || fiscalConfig.cnpj.trim() === '') {
      errors.push('CNPJ é obrigatório');
    }
    if (!fiscalConfig.razao_social || fiscalConfig.razao_social.trim() === '') {
      errors.push('Razão social é obrigatória');
    }
    if (!fiscalConfig.nome_fantasia || fiscalConfig.nome_fantasia.trim() === '') {
      errors.push('Nome fantasia é obrigatório');
    }
    if (!fiscalConfig.logradouro || fiscalConfig.logradouro.trim() === '') {
      errors.push('Logradouro é obrigatório');
    }
    if (!fiscalConfig.numero || fiscalConfig.numero.trim() === '') {
      errors.push('Número é obrigatório');
    }
    if (!fiscalConfig.bairro || fiscalConfig.bairro.trim() === '') {
      errors.push('Bairro é obrigatório');
    }
    if (!fiscalConfig.cidade || fiscalConfig.cidade.trim() === '') {
      errors.push('Cidade é obrigatória');
    }
    if (!fiscalConfig.uf || fiscalConfig.uf.trim() === '') {
      errors.push('UF é obrigatória');
    }
    if (!fiscalConfig.cep || fiscalConfig.cep.trim() === '') {
      errors.push('CEP é obrigatório');
    }
    if (!fiscalConfig.focus_nfe_token || fiscalConfig.focus_nfe_token.trim() === '') {
      errors.push('Token Focus NFe é obrigatório');
    }
    if (!fiscalConfig.cnae_principal || fiscalConfig.cnae_principal.trim() === '') {
      errors.push('CNAE principal é obrigatório');
    }
    
    // Validação de CNPJ
    if (fiscalConfig.cnpj && fiscalConfig.cnpj.trim() !== '') {
      const cnpjNumeros = fiscalConfig.cnpj.replace(/[^\d]/g, '');
      if (cnpjNumeros.length !== 14) {
        errors.push('CNPJ deve ter 14 dígitos');
      }
    }
    
    return { valid: errors.length === 0, errors };
  };

  return {
    validarConfiguracao
  };
}