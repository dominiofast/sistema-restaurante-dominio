// SUPABASE REMOVIDO
export interface CashbackTransaction {
  companyId: string;
  customerPhone: string;
  customerName: string;
  amount: number;
  orderId?: number;
  type: 'credit' | 'debit';
  description?: string;
}

export interface CashbackBalance {
  availableBalance: number;
  totalAccumulated: number;
  customerName: string;
}

export class CashbackService {
  /**
   * Gera cashback para um pedido baseado na configuração da empresa
   */
  static async generateOrderCashback(
    companyId: string, 
    customer: { nome: string; telefone: string }, 
    subtotal: number, 
    orderId: number
  ): Promise<boolean> {
    console.log('💰 [CASHBACK] Gerando cashback para pedido', orderId, 'subtotal:', subtotal);
    
    try {
      // 1. Verificar se a empresa tem cashback ativo
      const { data: config, error: configError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'cashback_config')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .eq\( REMOVIDO */ ; //'is_active', true)
        /* .maybeSingle\( REMOVIDO */ ; //);

      if (configError) {
        console.error('❌ [CASHBACK] Erro ao buscar configuração:', configError);
        return false;
      }

      if (!config) {
        console.log('⚠️ [CASHBACK] Cashback não está ativo para esta empresa');
        return false;
      }

      // 2. Verificar valor mínimo de compra
      if (subtotal < config.valor_minimo_compra) {
        console.log('⚠️ [CASHBACK] Valor do pedido abaixo do mínimo:', subtotal, 'vs', config.valor_minimo_compra);
        return false;
      }

      // 3. Calcular cashback baseado na configuração
      const cashbackValue = this.calculateCashbackAmount(subtotal, config.percentual_cashback / 100);
      
      if (!this.isValidCashbackAmount(cashbackValue)) {
        console.log('⚠️ [CASHBACK] Valor de cashback inválido:', cashbackValue);
        return false;
      }

      // 4. Verificar se já existe cashback para este pedido
      const { data: existingTransaction } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'cashback_transactions')
        /* .select\( REMOVIDO */ ; //'id')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .eq\( REMOVIDO */ ; //'pedido_id', orderId)
        /* .eq\( REMOVIDO */ ; //'tipo', 'credito')
        /* .maybeSingle\( REMOVIDO */ ; //);

      if (existingTransaction) {
        console.log('⚠️ [CASHBACK] Cashback já foi gerado para este pedido:', orderId);
        return true;
      }

      // 5. Registrar APENAS a transação de crédito
      // O trigger auto_recalculate_cashback_balance vai:
      // - Criar/atualizar automaticamente o registro em customer_cashback
      // - Calcular o saldo correto baseado em todas as transações
      const { error: transactionError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'cashback_transactions')
        /* .insert\( REMOVIDO */ ; //{
          company_id: companyId,
          customer_phone: customer.telefone,
          customer_name: customer.nome,
          valor: cashbackValue,
          tipo: 'credito',
          pedido_id: orderId,
          descricao: `Cashback ${config.percentual_cashback}% - Pedido #${orderId}`
        });

      if (transactionError) {
        console.error('❌ [CASHBACK] Erro ao registrar transação:', transactionError);
        return false;
      }

      console.log('✅ [CASHBACK] Cashback gerado com sucesso:', {
        valor: cashbackValue,
        percentual: config.percentual_cashback,
        pedido: orderId
      });

      return true;
    } catch (error) {
      console.error('❌ [CASHBACK] Erro na geração:', error);
      return false;
    }
  }

  /**
   * Debita cashback do saldo do cliente
   */
  static async debitCashback(
    companyId: string, 
    customer: { nome: string; telefone: string }, 
    amount: number, 
    orderId: number
  ): Promise<boolean> {
    console.log('💰 [CASHBACK] Debitando cashback de', amount, 'para o pedido', orderId);
    
    try {
      // 1. Verificar se já existe débito para este pedido
      const { data: existingDebit } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'cashback_transactions')
        /* .select\( REMOVIDO */ ; //'id')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .eq\( REMOVIDO */ ; //'pedido_id', orderId)
        /* .eq\( REMOVIDO */ ; //'tipo', 'debito')
        /* .maybeSingle\( REMOVIDO */ ; //);

      if (existingDebit) {
        console.log('⚠️ [CASHBACK] Débito já foi processado para este pedido:', orderId);
        return true;
      }

      // 2. Verificar saldo suficiente
      if (!await this.hasSufficientBalance(companyId, customer.telefone, amount)) {
        console.error('❌ [CASHBACK] Saldo insuficiente:', amount);
        return false;
      }

      // 3. Registrar APENAS a transação de débito
      // O trigger auto_recalculate_cashback_balance vai:
      // - Atualizar automaticamente o saldo em customer_cashback
      // - Garantir que o saldo fique sempre correto baseado nas transações
      const { error: transactionError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'cashback_transactions')
        /* .insert\( REMOVIDO */ ; //{
          company_id: companyId,
          customer_phone: customer.telefone,
          customer_name: customer.nome,
          valor: amount,
          tipo: 'debito',
          pedido_id: orderId,
          descricao: `Desconto aplicado - Pedido #${orderId}`
        });

      if (transactionError) {
        console.error('❌ [CASHBACK] Erro ao registrar débito:', transactionError);
        return false;
      }

      console.log('✅ [CASHBACK] Transação de débito registrada:', {
        valor: amount,
        pedido: orderId,
        observacao: 'Saldo será recalculado automaticamente pelo trigger'
      });

      return true;
    } catch (error) {
      console.error('❌ [CASHBACK] Erro no débito:', error);
      return false;
    }
  }

  /**
   * Busca o saldo de cashback do cliente usando função em tempo real
   */
  static async getCustomerBalance(
    companyId: string, 
    customerPhone: string
  ): Promise<CashbackBalance | null> {
    try {
      const { data, error } = await /* supabase REMOVIDO */ null; //rpc('get_realtime_cashback_balance', {
        p_company_id: companyId,
        p_customer_phone: customerPhone
      });

      if (error) {
        console.error('❌ Erro ao buscar saldo de cashback:', error);
        return null;
      }

      if (!data) {
        return {
          availableBalance: 0,
          totalAccumulated: 0,
          customerName: 'Cliente'
        };
      }

      return {
        availableBalance: (data as any)?.availableBalance || 0,
        totalAccumulated: (data as any)?.totalAccumulated || 0,
        customerName: (data as any)?.customerName || 'Cliente'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar saldo de cashback:', error);
      return null;
    }
  }

  /**
   * Busca histórico de transações do cliente
   */
  static async getCustomerTransactions(
    companyId: string, 
    customerPhone: string, 
    limit: number = 10
  ): Promise<CashbackTransaction[]> {
    try {
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'cashback_transactions')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .eq\( REMOVIDO */ ; //'customer_phone', customerPhone)
        /* .order\( REMOVIDO */ ; //'created_at', { ascending: false })
        /* .limit\( REMOVIDO */ ; //limit);

      if (error) {
        console.error('❌ Erro ao buscar transações de cashback:', error);
        return [];
      }

      return data?.map(transaction => ({
        companyId: transaction.company_id,
        customerPhone: transaction.customer_phone,
        customerName: transaction.customer_name,
        amount: transaction.valor,
        orderId: transaction.pedido_id,
        type: transaction.tipo as 'credit' | 'debit',
        description: transaction.descricao
      })) || [];
    } catch (error) {
      console.error('❌ Erro ao buscar transações de cashback:', error);
      return [];
    }
  }

  /**
   * Verifica se o cliente tem saldo suficiente usando função segura
   */
  static async hasSufficientBalance(
    companyId: string, 
    customerPhone: string, 
    requiredAmount: number
  ): Promise<boolean> {
    try {
      const { data, error } = await /* supabase REMOVIDO */ null; //rpc('check_sufficient_cashback_balance', {
        p_company_id: companyId,
        p_customer_phone: customerPhone,
        p_required_amount: requiredAmount
      });

      if (error) {
        console.error('❌ Erro ao verificar saldo suficiente:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('❌ Erro ao verificar saldo suficiente:', error);
      return false;
    }
  }

  /**
   * Calcula o valor de cashback baseado no subtotal
   */
  static calculateCashbackAmount(subtotal: number, percentage: number = 0.10): number {
    return Math.round((subtotal * percentage) * 100) / 100; // Arredonda para 2 casas decimais
  }

  /**
   * Valida se um valor de cashback é válido
   */
  static isValidCashbackAmount(amount: number): boolean {
    return amount > 0 && amount <= 10000; // Limite máximo de R$ 10.000
  }
}
