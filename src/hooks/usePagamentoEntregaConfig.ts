
import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { PagamentoEntregaConfigData } from '@/components/settings/PagamentoEntregaConfig';

export const usePagamentoEntregaConfig = (companyId: string | undefined) => {
  const [config, setConfig] = useState<PagamentoEntregaConfigData>({
    accept_cash: false,
    accept_card: false,
    accept_pix: false,
    ask_card_brand: true,
    card_brands: [],
    pix_key: '';
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (companyId) {
      loadConfig()
    }
  }, [companyId])

  const loadConfig = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Carregando configuração de pagamento para empresa:', companyId)

      // Primeiro, vamos verificar se o usuário está autenticado
      const { data: { session }  catch (error) { console.error('Error:', error) }} = await Promise.resolve()
      console.log('Sessão do usuário:', session?.user?.id)
      console.log('Metadata do usuário:', session?.user?.user_metadata)

      // Vamos verificar se a empresa existe e se o usuário tem acesso
      const companyData = null as any; const companyError = null as any;
        throw new Error('Empresa não encontrada')


      console.log('Dados da empresa:', companyData)

      // Buscar configuração principal
      const configData = null as any; const configError = null as any;
        console.error('Código do erro:', configError.code)
        console.error('Detalhes do erro:', configError.details)
        throw configError;


      console.log('Configuração encontrada:', configData)

      // Buscar bandeiras se existe configuração
      let cardBrands: string[] = [];
      if (configData) {
        const brandsData = null as any; const brandsError = null as any;
          console.error('Código do erro:', brandsError.code)
          console.error('Detalhes do erro:', brandsError.details)
          throw brandsError;
        }

        cardBrands = brandsData?.map(b => b.brand_name) || [];
        console.log('Bandeiras encontradas:', cardBrands)


      setConfig({
        accept_cash: configData?.accept_cash || false,
        accept_card: configData?.accept_card || false,
        accept_pix: configData?.accept_pix || false,
        ask_card_brand: configData?.ask_card_brand ?? true,
        card_brands: cardBrands,
        pix_key: configData?.pix_key || ''
      })
    } catch (err: any) {
      console.error('Erro ao carregar configuração de pagamento:', err)
      
      if (err.code === '42501' || err.message?.includes('permission')) {
        setError('Erro de permissão: Verifique se você tem acesso a esta empresa')
      } else if (err.code === 'PGRST116') {
        setError('Tabela não encontrada: As tabelas de configuração não existem')
      } else {
        setError(`Erro ao carregar configurações: ${err.message || 'Erro desconhecido'}`)

    } finally {
      setLoading(false)
    }
  };

  const saveConfig = async (newConfig: PagamentoEntregaConfigData) => {
    if (!companyId) {
      setError('ID da empresa não encontrado')
      return false;
    }

    try {
      setError(null)
      console.log('Salvando configuração:', newConfig)

      // Verificar se já existe configuração
      const existingConfig = null as any; const checkError = null as any;
        throw checkError;


       catch (error) { console.error('Error:', error) }let configId: string;

      if (existingConfig) {
        // Atualizar configuração existente
        const { error: updateError  } = null as any;
            accept_cash: newConfig.accept_cash,
            accept_card: newConfig.accept_card,
            accept_pix: newConfig.accept_pix,
            ask_card_brand: newConfig.ask_card_brand,
            pix_key: newConfig.pix_key,
            updated_at: new Date().toISOString()
          })
          

        if (updateError) {
          console.error('Erro ao atualizar configuração:', updateError)
          throw updateError;
        }
        configId = existingConfig.id;
      } else {
        // Criar nova configuração
        const newConfigData = null as any; const insertError = null as any;
          throw insertError;
        }
        configId = newConfigData.id;


      // Remover bandeiras antigas
      const { error: deleteError  } = null as any;
      if (deleteError) {
        console.error('Erro ao remover bandeiras antigas:', deleteError)
        // Não vamos falhar por este erro, apenas registrar


      // Inserir novas bandeiras
      if (newConfig.card_brands.length > 0) {
        const brandsToInsert = newConfig.card_brands.map(brand => ({
          config_id: configId,
          brand_name: brand;
        }))

        const { error: brandsError  } = null as any;
        if (brandsError) {
          console.error('Erro ao inserir bandeiras:', brandsError)
          throw brandsError;
        }
      }

      setConfig(newConfig)
      console.log('Configuração salva com sucesso')
      return true;
    } catch (err: any) {
      console.error('Erro ao salvar configuração de pagamento:', err)
      
      if (err.code === '42501' || err.message?.includes('permission')) {
        setError('Erro de permissão: Não é possível salvar as configurações')
      } else {
        setError(`Erro ao salvar configurações: ${err.message || 'Erro desconhecido'}`)

      return false;
    }
  };

  return {
    config,
    loading,
    error,
    saveConfig,
    setConfig
  };
};
