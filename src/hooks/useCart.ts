
import { useEffect } from 'react';
import { Produto } from '@/types/cardapio';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useStoreStatus } from './useStoreStatus';

// Importar hooks refatorados
import { CartItem, CartAdicionais } from './cart/types';
import { useCartStorage } from './cart/useCartStorage';
import { useCartCalculations } from './cart/useCartCalculations';
import { useCartAdicionais } from './cart/useCartAdicionais';

// Re-exportar types para compatibilidade
export type { CartItem, CartAdicionais };

export const useCart = (companySlug?: string, companyId?: string) => {
  const { currentCompany } = useAuth();
  const { carrinho, setCarrinho, isInitialized, limparCarrinho } = useCartStorage(companySlug, currentCompany?.id);
  const { calculateItemPrices } = useCartCalculations();
  const { processAdicionais } = useCartAdicionais();
  
  // Verificação de status da loja
  const storeCompanyId = companyId || currentCompany?.id;
  const { status: storeStatus } = useStoreStatus(storeCompanyId);

  // Escutar evento de reset diário
  useEffect(() => {
    const handleDailyReset = (event: CustomEvent) => {
      if (event.detail.companyId === currentCompany?.id) {
        // Reset diário detectado
        setCarrinho([]);
      }
    };

    window.addEventListener('pdv-daily-reset', handleDailyReset as EventListener);
    return () => {
      window.removeEventListener('pdv-daily-reset', handleDailyReset as EventListener);
    };
  }, [currentCompany]);

  const generateItemId = (produto: Produto, adicionais?: { [adicionalId: string]: number }, observacoes?: string) => {
    const adicionaisKey = adicionais 
      ? Object.keys(adicionais).sort().map(key => `${key}:${adicionais[key]}`).join(',')
      : '';
    const observacoesKey = observacoes ? `obs:${observacoes}` : '';
    return `${produto.id}-${adicionaisKey}-${observacoesKey}`;
  };

  const adicionarAoCarrinho = async (
    produto: Produto, 
    quantidade: number, 
    observacoes?: string,
    adicionais?: { [adicionalId: string]: number }
  ) => {
    // Iniciando adição ao carrinho

    // Validar se a loja está aberta antes de adicionar
    if (storeStatus && !storeStatus.isOpen) {
      // Loja fechada
      toast({
        title: "Loja fechada",
        description: storeStatus.message,
        variant: "destructive",
      });
      throw new Error('Loja fechada: ' + storeStatus.message);
    }

    try {
      const itemId = generateItemId(produto, adicionais, observacoes);
      const cartAdicionais = adicionais ? await processAdicionais(adicionais) : undefined;
      const { preco_unitario, preco_total } = calculateItemPrices(produto, quantidade, cartAdicionais);
      
      setCarrinho(prev => {
        const itemExistente = prev.find(item => item.id === itemId);
        
        let novoCarrinho;
        
        if (itemExistente) {
          const novaQuantidade = itemExistente.quantidade + quantidade;
          const { preco_unitario: newPrecoUnitario, preco_total: newPrecoTotal } = 
            calculateItemPrices(produto, novaQuantidade, cartAdicionais);
          
          novoCarrinho = prev.map(item =>
            item.id === itemId
              ? { 
                  ...item, 
                  quantidade: novaQuantidade,
                  preco_unitario: newPrecoUnitario,
                  preco_total: newPrecoTotal
                }
              : item
          );
        } else {
          const novoItem = { 
            id: itemId,
            produto, 
            quantidade, 
            adicionais: cartAdicionais,
            preco_unitario,
            preco_total,
            observacoes: observacoes || undefined
          };
          novoCarrinho = [...prev, novoItem];
        }
        
        return novoCarrinho;
      });
      
      // Item adicionado silenciosamente - removido toast conforme solicitado pelo usuário
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const removerDoCarrinho = (itemId: string) => {
    setCarrinho(prev => prev.filter(item => item.id !== itemId));
  };

  const atualizarQuantidade = (itemId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(itemId);
    } else {
      setCarrinho(prev =>
        prev.map(item => {
          if (item.id === itemId) {
            const { preco_unitario, preco_total } = 
              calculateItemPrices(item.produto, novaQuantidade, item.adicionais);
            return {
              ...item,
              quantidade: novaQuantidade,
              preco_unitario,
              preco_total
            };
          }
          return item;
        })
      );
    }
  };

  const atualizarObservacoes = (itemId: string, observacoes: string) => {
    console.log('🔧 Atualizando observações:', { itemId, observacoes });
    setCarrinho(prev => {
      console.log('🔧 Estado anterior do carrinho:', prev);
      const updated = prev.map(item => {
        if (item.id === itemId) {
          console.log('✅ Item encontrado, atualizando observações:', item);
          const itemAtualizado = {
            ...item,
            observacoes: observacoes || undefined
          };
          console.log('✅ Item atualizado:', itemAtualizado);
          return itemAtualizado;
        }
        return item;
      });
      console.log('🛒 Carrinho atualizado completo:', updated);
      
      // Verificar se a observação foi realmente salva
      const itemVerificacao = updated.find(item => item.id === itemId);
      console.log('🔍 Verificação final do item atualizado:', itemVerificacao);
      
      // Forçar salvamento imediato no localStorage
      const storageKey = companySlug ? `pdv_carrinho_${companySlug}` : `pdv_carrinho_${currentCompany?.id || 'default'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      console.log('💾 Carrinho salvo no localStorage:', storageKey);
      
      return updated;
    });
  };

  const totalCarrinho = carrinho.reduce(
    (total, item) => {
      return total + (isNaN(item.preco_total) ? 0 : item.preco_total);
    },
    0
  );

  const totalItens = carrinho.reduce(
    (total, item) => {
      return total + item.quantidade;
    },
    0
  );

  // Estado final do carrinho calculado

  return {
    carrinho,
    adicionarAoCarrinho,
    removerDoCarrinho,
    atualizarQuantidade,
    atualizarObservacoes,
    limparCarrinho,
    totalCarrinho,
    totalItens
  };
};
