import { useCallback } from 'react';
import type { ClientePublico, CheckoutStep, DeliveryInfo } from './useCheckoutFlow';
import { createOrder as createOrderViaGateway } from '@/services/orderGateway';

// Tipos para as dependências do hook
interface CheckoutHandlersDependencies {
  // Estados do checkout
  setStep: (step: CheckoutStep) => void;
  setCliente: (cliente: ClientePublico | null) => void;
  setEndereco: (endereco: string) => void;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  setCartOpen: (open: boolean) => void;
  
  // Dados necessários
  cliente: ClientePublico | null;
  endereco: string;
  deliveryInfo: DeliveryInfo;
  carrinho: any[];
  company: any;
  company_slug: string; // ← Adicionado company_slug
  
  // Hooks e funções externas
  temDadosSalvos: boolean;
  clientePersistente: ClientePublico | null;
  salvarCliente: (cliente: ClientePublico) => void;
  createOrder: (orderData: any, callback?: () => void) => Promise<any>;
  limparCarrinho: () => void;
}

// Interface para os handlers retornados
interface CheckoutHandlers {
  handleCheckout: () => void;
  handleIdentificacaoComplete: (nome: string, telefone: string) => void;
  handleTrocarConta: () => void;
  handleCheckoutComplete: (deliveryData: { tipo: 'delivery' | 'pickup'; endereco?: any; taxaEntrega?: number }) => void;
  handlePaymentComplete: (paymentMethod: string) => Promise<void>;
}

/**
 * Hook customizado para gerenciar as funções de manipulação do checkout
 * 
 * Este hook centraliza todas as funções relacionadas ao processo de checkout,
 * incluindo navegação entre steps, identificação do cliente e finalização do pedido.
 * Todas as funções são memoizadas com useCallback para otimização de performance.
 * 
 * @param {CheckoutHandlersDependencies} deps - Dependências necessárias para as funções
 * @returns {CheckoutHandlers} Objeto contendo todas as funções de manipulação
 * 
 * @example
 * ```tsx
 * const {
 *   handleCheckout,
 *   handleIdentificacaoComplete,
 *   handleTrocarConta,
 *   handleCheckoutComplete,
 *   handlePaymentComplete
 * } = useCheckoutHandlers({
 *   setStep,
 *   setCliente,
 *   // ... outras dependências
 * });
 * ```
 */
export const useCheckoutHandlers = (deps: CheckoutHandlersDependencies): CheckoutHandlers => {
  const {
    setStep,
    setCliente,
    setEndereco,
    setDeliveryInfo,
    setCartOpen,
    cliente,
    endereco,
    deliveryInfo,
    carrinho,
    company,
    company_slug, // ← Adicionado company_slug
    temDadosSalvos,
    clientePersistente,
    salvarCliente,
    createOrder,
    limparCarrinho
  } = deps;

  const handleCheckout = useCallback(() => {
    setCartOpen(false);
    
    // Se tem dados salvos, usar diretamente e ir direto para checkout
    if (temDadosSalvos && clientePersistente) {
      setCliente(clientePersistente);
      setEndereco(''); // Será selecionado no CheckoutModal
      setStep('checkout');
    } else {
      setStep('identificacao');
    }
  }, [temDadosSalvos, clientePersistente, setCartOpen, setCliente, setEndereco, setStep]);

  const handleIdentificacaoComplete = useCallback((nome: string, telefone: string) => {
    const dadosCliente = { nome, telefone };
    setCliente(dadosCliente);
    salvarCliente(dadosCliente);
    console.log('💾 Dados do cliente salvos para futuros pedidos:', dadosCliente);
    setStep('checkout');
  }, [setCliente, salvarCliente, setStep]);

  const handleTrocarConta = useCallback(() => {
    setCliente(null);
    setStep('identificacao');
  }, [setCliente, setStep]);

  const handleCheckoutComplete = useCallback((deliveryData: { tipo: 'delivery' | 'pickup'; endereco?: any; taxaEntrega?: number }) => {
    setDeliveryInfo(deliveryData);
    setStep('payment');
    
    // Não navegar de volta para o cardápio - manter no fluxo de checkout
    // A navegação só deve acontecer quando o usuário cancelar ou finalizar o pedido
  }, [setDeliveryInfo, setStep]);

  const handlePaymentComplete = useCallback(async (paymentMethod: string) => {
    console.log('💳 Método de pagamento selecionado:', paymentMethod);
    
    if (!cliente || !company || !deliveryInfo) {
      console.error('❌ Dados obrigatórios faltando');
      return;
    }

    try {
      // Parse do cashback se aplicado
      let cashbackAplicado = 0;
      try {
        const parsedPayment = JSON.parse(paymentMethod);
        cashbackAplicado = parsedPayment.cashbackApplied || 0;
      } catch {
        // Se não conseguir fazer parse, usar como string simples
      }

      const orderData = {
        cliente,
        endereco,
        carrinho,
        company,
        deliveryInfo,
        paymentMethod,
        cashbackAplicado
      };

      const onCashbackUpdate = () => {
        // Este callback será chamado após o pedido ser criado para recarregar o saldo
        console.log('🔄 Callback para atualizar cashback executado');
      };

      // 🚀 NOVA SOLUÇÃO: OrderGateway com endpoint seguro
      console.log('📦 Criando pedido via OrderGateway seguro:', orderData);
      
      const pedidoData = {
        companyId: company.id,
        cliente: {
          nome: orderData.cliente.nome,
          telefone: orderData.cliente.telefone
        },
        endereco: orderData.endereco,
        itens: orderData.carrinho.map((item: any) => ({
          produto_id: item.id,
          nome: item.name,
          preco: item.price,
          quantidade: item.quantity,
          adicionais: item.adicionais || []
        })),
        total: deliveryInfo.taxaEntrega ? (deliveryInfo.taxaEntrega + 50) : 50, // calcular total
        forma_pagamento: orderData.paymentMethod || 'dinheiro',
        tipo: deliveryInfo.tipo || 'delivery',
        observacoes: null
      };
      
      const result = await createOrderViaGateway(pedidoData);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar pedido');
      }
      
      console.log('✅ Pedido criado com sucesso via OrderGateway:', result);
      
      // Executar callback para atualizar cashback se necessário
      if (onCashbackUpdate) {
        onCashbackUpdate();
      }

      // Redirecionar para página de acompanhamento
      const numeroPedido = result.pedido.numero_pedido || result.pedido.id;
      // ✅ CORRETO - Usa company_slug em vez de company.id
      window.location.href = `/${company_slug}/pedido/${numeroPedido}`;
      
      // Limpar carrinho e resetar estado
      limparCarrinho();
      setCliente(null);
      setEndereco('');
      setStep('cart');
      setCartOpen(false);

    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error);
      alert('❌ Erro ao criar pedido. Tente novamente.');
    }
  }, [
    cliente,
    company,
    company_slug, // ← Adicionado company_slug
    deliveryInfo,
    endereco,
    carrinho,
    createOrder,
    limparCarrinho,
    setCliente,
    setEndereco,
    setStep,
    setCartOpen
  ]);

  return {
    handleCheckout,
    handleIdentificacaoComplete,
    handleTrocarConta,
    handleCheckoutComplete,
    handlePaymentComplete,
  };
};

// Exportar tipos para uso em outros arquivos
export type { CheckoutHandlersDependencies, CheckoutHandlers };