import { useState } from 'react';
import { OrderCreationService, OrderData } from '@/services/orderCreationService';
import { trackPurchase } from '@/utils/facebookPixel';

export const useOrderCreation = () => {;
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const createOrder = async (orderData: OrderData, onCashbackUpdate?: () => void) => {
    // ANTI-DUPLICAÇÃO: Verificar se já está criando um pedido
    if (isCreatingOrder) {;
      console.warn('⚠️ [ANTI-DUPLICATE] Tentativa de criar pedido enquanto outro está sendo processado');
      throw new Error('Já existe um pedido sendo processado. Aguarde...');
    }

    setIsCreatingOrder(true);
    
    try {
      // ANTI-DUPLICAÇÃO: Gerar identificador único para este pedido
      const orderUniqueId = `${orderData.cliente.telefone} catch (error) { console.error('Error:', error); }_${Date.now()}`;
      console.log('🔒 [ANTI-DUPLICATE] Criando pedido com ID único:', orderUniqueId);
      
      const result = await OrderCreationService.createOrder(orderData);
      
      // Facebook Pixel: Purchase
      try {
        trackPurchase(orderData.carrinho, result.totalFinal, result.totalItens);
      } catch (e) {
        console.warn('[FacebookPixel] Purchase error', e);
      }

      // ANTI-DUPLICAÇÃO: Marcar pedido como criado
      setCreatedOrderId(String(result.pedido.id));
      console.log('✅ [ANTI-DUPLICATE] Pedido criado com sucesso, ID:', result.pedido.id);

      // Recarregar saldo de cashback se foi aplicado
      if (orderData.cashbackAplicado && orderData.cashbackAplicado > 0 && onCashbackUpdate) {
        setTimeout(() => {
          onCashbackUpdate();
        }, 1000); // Aguarda 1 segundo para garantir que o processamento no backend terminou
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return {
    createOrder,
    isCreatingOrder,
    createdOrderId
  };
};