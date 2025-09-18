import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFiscalOperations } from './useCompanyFiscalOperations';
import { useCompanyFiscalValidation } from './useCompanyFiscalValidation';

export interface CompanyFiscalConfig {
  id?: string;
  company_id: string;
  cnpj: string;
  inscricao_estadual?: string;
  regime_tributario?: string;
  razao_social?: string;
  nome_fantasia?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  cnae_principal?: string;
  ie_substituicao_tributaria?: string;
  codigo_regime_tributario?: string;
  natureza_operacao?: string;
  finalidade_emissao?: string;
  presenca_comprador?: string;
  consumidor_final?: boolean;
  indicador_ie_destinatario?: string;
  certificado_status?: string;
  certificado_validade?: string;
  certificado_senha?: string;
  certificado_path?: string;
  focus_nfe_token?: string;
  focus_nfe_ambiente?: string;
  nfce_serie?: number;
  nfce_proxima_numeracao?: number;
  nfce_token?: string;
  nfce_id_token?: string;
  nfe_serie?: number;
  nfe_proxima_numeracao?: number;
  informacao_complementar_nfce?: string;
  email_xmls?: string;


export function useCompanyFiscalConfig() {
  const { currentCompany } = useAuth()
  const [fiscalConfig, setFiscalConfig] = useState<CompanyFiscalConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { gerarNFCe, consultarNFCe, cancelarNFCe } = useCompanyFiscalOperations(currentCompany?.id)
  const { validarConfiguracao } = useCompanyFiscalValidation()

  const fetchFiscalConfig = async () => {
    if (!currentCompany?.id) {
      console.log('fetchFiscalConfig: No company ID available')
      return;
    }

    try {
      setLoading(true)
      console.log('fetchFiscalConfig: Fetching config for company:', currentCompany.id)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        

      if (error) {
        console.error('fetchFiscalConfig: Supabase error:', error)
        throw error;
      }

      console.log('fetchFiscalConfig: Data received:', data)

      if (data) {
        setFiscalConfig(data)
      } else {
        console.log('fetchFiscalConfig: No data found, creating default config')
        const defaultConfig: Omit<CompanyFiscalConfig, 'id'> = {
          company_id: currentCompany.id,
          cnpj: '',
          regime_tributario: 'simples_nacional',
          certificado_status: 'pendente',
          focus_nfe_ambiente: 'homologacao',
          nfce_serie: 1,
          nfce_proxima_numeracao: 1,
          nfe_serie: 1,
          nfe_proxima_numeracao: 1,
          natureza_operacao: 'Venda',
          finalidade_emissao: '1',
          presenca_comprador: '1',
          consumidor_final: true,
          indicador_ie_destinatario: '9',
        };
        setFiscalConfig(defaultConfig)
      }
    } catch (err) {
      console.error('fetchFiscalConfig: Error:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  };

  const saveFiscalConfig = async (config: Partial<CompanyFiscalConfig>) => {
    console.log('saveFiscalConfig: Starting with config:', config)
    if (!currentCompany?.id) {
      console.log('saveFiscalConfig: No company ID available')
      return false;
    }

    try {
      setError(null)
      console.log('saveFiscalConfig: Saving config for company:', currentCompany.id)
      
      // Garantir que campos obrigatórios estejam presentes e limpar campos vazios
      const cleanConfig = Object.fromEntries(
        Object.entries(config).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      )

      const dataToSave = {
        ...cleanConfig,
        company_id: currentCompany.id,
        cnpj: config.cnpj || fiscalConfig?.cnpj || '',
        // Garantir que certificado_validade seja string se fornecido
        ...(config.certificado_validade 
          ? { certificado_validade: String(config.certificado_validade) };
           catch (error) { console.error('Error:', error) }: {}
        ),
        updated_at: new Date().toISOString(),
      };

      console.log('saveFiscalConfig: Data to save (final):', dataToSave)

      if (fiscalConfig?.id) {
        console.log('saveFiscalConfig: Updating existing record with ID:', fiscalConfig.id)
        const { data, error  } = null as any;
        if (error) {
          console.error('saveFiscalConfig: Update error:', error)
          throw error;
        }
        console.log('saveFiscalConfig: Update successful:', data)
        setFiscalConfig(data)
      } else {
        console.log('saveFiscalConfig: Creating new record')
        const { data, error  } = null as any;
        if (error) {
          console.error('saveFiscalConfig: Insert error:', error)
          throw error;
        }
        console.log('saveFiscalConfig: Insert successful:', data)
        setFiscalConfig(data)
      }

      console.log('saveFiscalConfig: Operation completed successfully')
      return true;
    } catch (err) {
      console.error('saveFiscalConfig: Error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      return false;
    }
  };

  useEffect(() => {
    fetchFiscalConfig()
  }, [currentCompany?.id])

  return {
    fiscalConfig,
    loading,
    error,
    saveFiscalConfig,
    validarConfiguracao: () => validarConfiguracao(fiscalConfig),
    gerarNFCe,
    consultarNFCe,
    cancelarNFCe,
    refetch: fetchFiscalConfig,
  };

