import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { useToast } from '@/hooks/use-toast';

export interface AsaasConfig {
  id: string;
  company_id: string;
  api_key: string | null;
  pix_enabled: boolean;
  card_enabled: boolean;
  is_active: boolean;
  sandbox_mode: boolean;
  webhook_token: string | null;
  created_at: string | null;
  updated_at: string | null;


export interface AsaasConfigData {
  api_key: string;
  pix_enabled: boolean;
  card_enabled: boolean;
  is_active: boolean;
  sandbox_mode: boolean;
  webhook_token: string;


export const useAsaasConfig = (companyId?: string) => {
  const [config, setConfig] = useState<AsaasConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Carregar configuração
  useEffect(() => {
    if (!companyId) {
      setLoading(false)
      return;
    }

    const loadConfig = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error }  catch (error) { console.error('Error:', error) }= 
          
          
          
          

        if (error) {
          console.error('Erro ao carregar configuração do Asaas:', error)
          setError(error.message)
        } else {
          setConfig(data)
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError('Erro inesperado ao carregar configuração')
      } finally {
        setLoading(false)

    };

    loadConfig()
  }, [companyId])

  // Salvar configuração
  const saveConfig = async (configData: AsaasConfigData): Promise<boolean> => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'ID da empresa não encontrado',
        variant: 'destructive',;
      })
      return false;
    }

    try {
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
          company_id: companyId,
          ...configData,
        }, {
          onConflict: 'company_id'
        })
        
        

      if (error) {
        console.error('Erro ao salvar configuração do Asaas:', error)
        toast({
          title: 'Erro ao salvar',
          description: error.message,
          variant: 'destructive',
        })
        return false;


      setConfig(data)
      toast({
        title: 'Configuração salva',
        description: 'Configuração do Asaas salva com sucesso!',
      })
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err)
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro inesperado ao salvar a configuração',
        variant: 'destructive',
      })
      return false;
    }
  };

  // Testar credenciais
  const testCredentials = async (apiKey: string, sandboxMode: boolean): Promise<boolean> => {
    try {
      // Validação básica do formato
      if (sandboxMode && !apiKey.includes('YTU5YjFiNTQtNjQ2NC00')) {
        toast({
          title: 'Formato inválido',
          description: 'API Key de sandbox deve conter o identificador de teste',
          variant: 'destructive',;
        } catch (error) { console.error('Error:', error) })
        return false;


      // Teste de conectividade - listar clientes (endpoint simples)
      const baseUrl = sandboxMode 
        ? 'https://sandbox.asaas.com/api/v3';
        : 'https://www.asaas.com/api/v3';

      const response = await fetch(`${baseUrl}/customers?limit=1`, {
        method: 'GET',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json',
        },;
      })

      if (response.ok) {
        toast({
          title: 'Credenciais válidas',
          description: `API Key do Asaas validada (${sandboxMode ? 'Sandbox' : 'Produção'})`,
        })
        return true;
      } else {
        const errorData = await response.json()
        toast({
          title: 'Credenciais inválidas',
          description: errorData.errors?.[0]?.description || 'Erro ao validar API Key',
          variant: 'destructive',
        })
        return false;

    } catch (err) {
      console.error('Erro ao testar credenciais:', err)
      toast({
        title: 'Erro no teste',
        description: 'Não foi possível testar as credenciais',
        variant: 'destructive',
      })
      return false;
    }
  };

  return {
    config,
    loading,
    error,
    saveConfig,
    testCredentials,
    setConfig,
  };
};
