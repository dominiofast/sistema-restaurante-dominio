// SUPABASE REMOVIDO
import { focusNFeService } from '@/services/focusNFeService';

export interface FiscalNFeOperations {
  gerarNFCe: (dadosPedido: any, pedidoId?: number) => Promise<any>;
  consultarNFCe: (chave: string) => Promise<any>;
  cancelarNFCe: (chave: string, justificativa: string) => Promise<any>;
}

export function useCompanyFiscalOperations(companyId: string | undefined): FiscalNFeOperations {
  const gerarNFCe = async (dadosPedido: any, pedidoId?: number) => {
    if (!companyId) {
      console.error('❌ Company ID não encontrado:', companyId)
      throw new Error('Empresa não selecionada')
    }

    console.log('🏢 Company ID para NFCe:', companyId)
    console.log('📋 Dados do pedido completos:', dadosPedido)

    try {
      // Usar o FocusNFeService que converte corretamente os dados
      const resultado = await focusNFeService.gerarNFCe(companyId, dadosPedido, pedidoId)
      console.log('📥 Resultado do service:', resultado)
      return resultado;
    } catch (error) {
      console.error('❌ Erro completo ao gerar NFCe:', error)
      console.error('❌ Stack trace:', error.stack)
      throw error;
    }
  };

  const consultarNFCe = async (referencia: string) => {
    if (!companyId) throw new Error('Empresa não selecionada')

    try {
      const response = await Promise.resolve()
        body: {
          action: 'consultar-nfce',
          company_id: companyId,
          referencia: referencia
        };
       catch (error) { console.error('Error:', error) }})

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar NFCe:', error)
      throw error;
    }
  };

  const cancelarNFCe = async (chave: string, justificativa: string) => {
    if (!companyId) throw new Error('Empresa não selecionada')

    try {
      const response = await Promise.resolve()
        body: {
          action: 'cancelar-nfce',
          company_id: companyId,
          chave: chave,
          justificativa: justificativa
        };
       catch (error) { console.error('Error:', error) }})

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar NFCe:', error)
      throw error;
    }
  };

  return {
    gerarNFCe,
    consultarNFCe,
    cancelarNFCe
  };
}
