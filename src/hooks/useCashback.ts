import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CashbackService } from '@/services/CashbackService';

interface CashbackHookReturn {
  saldoDisponivel: number;
  loading: boolean;
  aplicarCashback: (valor: number, pedidoId?: number) => Promise<boolean>;
  marcarPendente: (valor: number) => void;
  removerCashback: () => void;
  aplicado: boolean;
  valorAplicado: number;
  pendente: boolean;
  valorPendente: number;
  fetchSaldo: () => Promise<void>;
}

export const useCashback = (
  companyId: string,
  customerPhone?: string,
  totalPedido: number = 0
): CashbackHookReturn => {
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aplicado, setAplicado] = useState(false);
  const [valorAplicado, setValorAplicado] = useState(0);
  const [pendente, setPendente] = useState(false);
  const [valorPendente, setValorPendente] = useState(0);

  const fetchSaldo = async () => {
    if (!customerPhone || !companyId) {
      setSaldoDisponivel(0);
      return;
    }

    try {
      setLoading(true);
      const balance = await CashbackService.getCustomerBalance(companyId, customerPhone);
      setSaldoDisponivel(balance?.availableBalance || 0);
    } catch (error) {
      console.error("Erro ao buscar saldo de cashback:", error);
      setSaldoDisponivel(0);
    } finally {
      setLoading(false);
    }
  };

  const aplicarCashback = async (valor: number, pedidoId?: number): Promise<boolean> => {
    if (!customerPhone || !companyId || valor <= 0) return false;

    // Verificar se tem saldo suficiente usando função segura
    const temSaldo = await CashbackService.hasSufficientBalance(companyId, customerPhone, valor);
    
    if (!temSaldo) {
      console.error('❌ Saldo insuficiente para aplicar cashback:', valor);
      return false;
    }

    // Marcar como aplicado para o frontend
    setValorAplicado(valor);
    setAplicado(true);
    setPendente(false);
    setValorPendente(0);
    
    return true;
  };

  const marcarPendente = (valor: number) => {
    const valorAUsar = Math.min(saldoDisponivel, valor);
    if (valorAUsar <= 0) return;
    
    setPendente(true);
    setValorPendente(valorAUsar);
    setAplicado(false);
    setValorAplicado(0);
  };

  const removerCashback = () => {
    setAplicado(false);
    setValorAplicado(0);
    setPendente(false);
    setValorPendente(0);
  };

  // Real-time subscription para mudanças no cashback
  useEffect(() => {
    if (!customerPhone || !companyId) return;

    // Buscar saldo inicial
    fetchSaldo();

    // Configurar real-time subscription para transações
    const transactionChannel = supabase
      .channel('cashback-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cashback_transactions',
          filter: `company_id=eq.${companyId},customer_phone=eq.${customerPhone}`
        },
        (payload) => {
          console.log('💰 [REALTIME] Transação de cashback alterada:', payload);
          // Recarregar saldo quando houver mudanças nas transações
          fetchSaldo();
        }
      )
      .subscribe();

    // Configurar real-time subscription para saldos
    const balanceChannel = supabase
      .channel('cashback-balance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_cashback',
          filter: `company_id=eq.${companyId},customer_phone=eq.${customerPhone}`
        },
        (payload) => {
          console.log('💰 [REALTIME] Saldo de cashback alterado:', payload);
      if (payload.eventType === 'UPDATE' && payload.new) {
        // Atualizar saldo diretamente sem nova consulta
        setSaldoDisponivel((payload.new as any).saldo_disponivel || 0);
          } else {
            // Para outros eventos, recarregar
            fetchSaldo();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('💰 [REALTIME] Desconectando canais de cashback');
      supabase.removeChannel(transactionChannel);
      supabase.removeChannel(balanceChannel);
    };
  }, [customerPhone, companyId]);

  return {
    saldoDisponivel,
    loading,
    aplicarCashback,
    marcarPendente,
    removerCashback,
    aplicado,
    valorAplicado,
    pendente,
    valorPendente,
    fetchSaldo
  };
};