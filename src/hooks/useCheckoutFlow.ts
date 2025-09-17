import { useState } from 'react';

// Tipos extraídos do CardapioPublico
type ClientePublico = { nome: string; telefone: string };

type CheckoutStep = 'cart' | 'identificacao' | 'checkout' | 'payment';

type DeliveryInfo = {
  tipo: 'delivery' | 'pickup';
  endereco?: any;
  taxaEntrega?: number;
} | null;

// Interface para o estado do checkout
interface CheckoutFlowState {
  step: CheckoutStep;
  cliente: ClientePublico | null;
  endereco: string;
  deliveryInfo: DeliveryInfo;
}

// Interface para as ações do checkout
interface CheckoutFlowActions {
  setStep: (step: CheckoutStep) => void;
  setCliente: (cliente: ClientePublico | null) => void;
  setEndereco: (endereco: string) => void;
  setDeliveryInfo: (info: DeliveryInfo) => void;
}

/**
 * Hook customizado para gerenciar o estado do fluxo de checkout
 * 
 * Este hook centraliza todos os estados relacionados ao processo de checkout,
 * incluindo step atual, dados do cliente, endereço e informações de entrega.
 * 
 * @returns {CheckoutFlowState & CheckoutFlowActions} Objeto contendo estados e ações
 * 
 * @example
 * ```tsx
 * const {
 *   step, setStep,
 *   cliente, setCliente,
 *   endereco, setEndereco,
 *   deliveryInfo, setDeliveryInfo
 * } = useCheckoutFlow();
 * ```
 */
export const useCheckoutFlow = (): CheckoutFlowState & CheckoutFlowActions => {
  // Estados extraídos do CardapioPublico - mantendo valores iniciais idênticos
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [cliente, setCliente] = useState<ClientePublico | null>(null);
  const [endereco, setEndereco] = useState<string>('');
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>(null);

  return {
    // Estado
    step,
    cliente,
    endereco,
    deliveryInfo,
    
    // Ações
    setStep,
    setCliente,
    setEndereco,
    setDeliveryInfo,
  };
};

// Exportar tipos para uso em outros arquivos
export type { ClientePublico, CheckoutStep, DeliveryInfo, CheckoutFlowState, CheckoutFlowActions };