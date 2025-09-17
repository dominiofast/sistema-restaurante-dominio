import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NFCeLog {
  id: string;
  company_id: string;
  pedido_id: number;
  chave_nfe?: string;
  numero_nfce?: number;
  serie?: number;
  status: string;
  url_danfe?: string;
  referencia?: string;
  protocolo_autorizacao?: string;
  data_autorizacao?: string;
  response_data?: any;
  created_at?: string;
  updated_at?: string;
  xml_nfce?: string;
  error_message?: string;
  motivo_cancelamento?: string;
  justificativa_cancelamento?: string;
}

export function useNFCeLogs(companyId: string | undefined) {
  const [nfceLogs, setNfceLogs] = useState<Record<number, NFCeLog>>({});
  const [loading, setLoading] = useState(false);

  // Buscar logs existentes para a empresa
  const fetchNFCeLogs = async () => {
    if (!companyId) return;

    console.log('🔍 Buscando logs NFCe para company:', companyId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nfce_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar logs NFCe:', error);
        return;
      }

      console.log('📊 Logs NFCe encontrados:', data?.length || 0);

      // Organizar logs por pedido_id
      const logsMap = data.reduce((acc, log) => {
        if (log.pedido_id) {
          acc[log.pedido_id] = log;
        }
        return acc;
      }, {} as Record<number, NFCeLog>);

      setNfceLogs(logsMap);
    } catch (error) {
      console.error('❌ Erro ao buscar logs NFCe:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar se um pedido já tem NFCe gerada
  const hasNFCe = (pedidoId: number): boolean => {
    return !!nfceLogs[pedidoId];
  };

  // Obter dados da NFCe de um pedido
  const getNFCeData = (pedidoId: number): NFCeLog | null => {
    return nfceLogs[pedidoId] || null;
  };

  // Salvar log de NFCe gerada
  const saveNFCeLog = async (
    pedidoId: number,
    nfceData: any,
    responseData: any
  ): Promise<boolean> => {
    if (!companyId) {
      console.error('❌ Company ID não encontrado para salvar log NFCe');
      return false;
    }

    console.log('💾 Iniciando salvamento do log NFCe:', { pedidoId, companyId });
    console.log('📊 Dados NFCe para salvar:', nfceData);

    try {
      const logData = {
        company_id: companyId,
        pedido_id: pedidoId,
        chave_nfe: nfceData.chave_nfce || nfceData.chave_nfe,
        numero_nfce: parseInt(nfceData.numero_nfce) || null,
        serie: parseInt(nfceData.serie) || 1,
        status: nfceData.status || 'autorizada',
        url_danfe: nfceData.url_danfe,
        referencia: nfceData.ref || nfceData.referencia,
        protocolo_autorizacao: nfceData.protocolo_autorizacao,
        data_autorizacao: nfceData.data_autorizacao,
        response_data: responseData
      };

      console.log('📋 Dados preparados para insert:', logData);

      const { data, error } = await supabase
        .from('nfce_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro detalhado ao salvar log NFCe:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return false;
      }

      console.log('✅ Log NFCe salvo com sucesso:', data);

      // Atualizar estado local
      setNfceLogs(prev => ({
        ...prev,
        [pedidoId]: data
      }));

      return true;
    } catch (error: any) {
      console.error('❌ Erro de exceção ao salvar log NFCe:', {
        error,
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  };

  // Carregar logs ao inicializar
  useEffect(() => {
    fetchNFCeLogs();
  }, [companyId]);

  return {
    nfceLogs,
    loading,
    hasNFCe,
    getNFCeData,
    saveNFCeLog,
    refreshLogs: fetchNFCeLogs
  };
}