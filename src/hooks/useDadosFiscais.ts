import { useState, useCallback } from 'react';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';

export interface DadosFiscais {
  id?: string;
  tipo_fiscal_id: string;
  company_id: string;
  descricao: string;
  ean?: string;
  codigo_beneficio_fiscal?: string;
  ncm: string;
  origem_mercadoria: string;
  cfop?: string;
  
  // ICMS
  icms_situacao_tributaria?: string;
  icms_origem?: string;
  icms_percentual_base?: number;
  icms_aliquota?: number;
  icms_modalidade_base?: string;
  icms_percentual_fcp?: number;
  icms_reducao_base?: number;
  
  // ICMS ST
  icms_st_percentual_base?: number;
  icms_st_aliquota?: number;
  icms_st_modalidade_base?: string;
  icms_st_mva?: number;
  icms_st_percentual_fcp?: number;
  icms_st_reducao_base?: number;
  
  // ICMS Efetivo
  icms_efetivo_percentual_base?: number;
  icms_efetivo_aliquota?: number;
  
  // PIS/COFINS
  pis_situacao_tributaria?: string;
  aliquota_pis?: number;
  pis_base_calculo?: number;
  cofins_situacao_tributaria?: string;
  aliquota_cofins?: number;
  cofins_base_calculo?: number;
  
  // IPI
  aliquota_ipi?: number;
  ipi_situacao_tributaria?: string;
  ipi_codigo_enquadramento?: string;
  
  // CEST
  cest?: string;
  
  // Observações
  observacoes?: string;
  
  created_at?: string;
  updated_at?: string;


export function useDadosFiscais() {
  const { currentCompany } = useAuth()
  const [dadosFiscais, setDadosFiscais] = useState<DadosFiscais | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarDadosFiscais = useCallback(async (tipoFiscalId: string) => {
    if (!currentCompany?.id) return;

    try {
      setLoading(true)
      setError(null)

      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        
        

      if (error && error.code !== 'PGRST116') throw error;

      setDadosFiscais(data)
    } catch (err: any) {
      console.error('Erro ao buscar dados fiscais:', err)
      setError(err.message)
    } finally {
      setLoading(false)

  }, [currentCompany?.id])

  const salvarDadosFiscais = async (tipoFiscalId: string, dados: Omit<DadosFiscais, 'id' | 'tipo_fiscal_id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!currentCompany?.id) throw new Error('Empresa não selecionada')

    try {
      setLoading(true)
      setError(null)

      console.log('Salvando dados fiscais - TipoFiscalId:', tipoFiscalId)
      console.log('Salvando dados fiscais - CompanyId:', currentCompany.id)
      console.log('Salvando dados fiscais - Dados recebidos:', dados)

      const dadosCompletos = {
        ...dados,
        tipo_fiscal_id: tipoFiscalId,
        company_id: currentCompany.id;
      } catch (error) { console.error('Error:', error) };

      console.log('Salvando dados fiscais - Dados completos:', dadosCompletos)
      console.log('Salvando dados fiscais - Existe ID?', dadosFiscais?.id)

      let result;

      if (dadosFiscais?.id) {
        // Atualizar existente
        console.log('Atualizando dados existentes com ID:', dadosFiscais.id)
        const { data, error  } = null as any;
        console.log('Resultado da atualização:', { data, error })
        if (error) throw error;
        result = data;
      } else {
        // Criar novo
        console.log('Criando novos dados fiscais')
        const { data, error  } = null as any;
        console.log('Resultado da inserção:', { data, error })
        if (error) throw error;
        result = data;


      console.log('Resultado final:', result)
      setDadosFiscais(result)
      return result;
    } catch (err: any) {
      console.error('Erro ao salvar dados fiscais:', err)
      setError(err.message)
      throw err;
    } finally {
      setLoading(false)

  };

  return {
    dadosFiscais,
    loading,
    error,
    buscarDadosFiscais,
    salvarDadosFiscais,
    setDadosFiscais
  };
