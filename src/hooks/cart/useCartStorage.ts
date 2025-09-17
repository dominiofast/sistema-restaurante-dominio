import { useState, useEffect, useRef } from 'react';
import { CartItem } from './types';
import { usePageVisibility } from '../usePageVisibility';

export const useCartStorage = (companySlug?: string, currentCompanyId?: string) => {
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isVisible } = usePageVisibility();
  const lastSaveTime = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook inicializado sem logs de debug

  const getStorageKey = () => {
    // Para páginas públicas, usar o slug da empresa
    if (companySlug) {
      return `pdv_carrinho_${companySlug}`;
    }
    // Para páginas autenticadas, usar o ID da empresa
    return `pdv_carrinho_${currentCompanyId || 'default'}`;
  };

  // Carregar carrinho do localStorage na inicialização (APENAS UMA VEZ)
  useEffect(() => {
    if (isInitialized) return; // Evitar recarregamentos
    
    const storageKey = getStorageKey();
    
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart && savedCart !== '[]') { // Verificar se não é um array vazio
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.length > 0) {
          setCarrinho(parsedCart);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar carrinho do localStorage:', error);
        localStorage.removeItem(storageKey);
      }
    } else {
      // Nenhum carrinho válido encontrado
    }
    
    setIsInitialized(true);
  }, [currentCompanyId, companySlug, isInitialized]);

  // Função de salvamento otimizada com debounce
  const saveToStorage = (cartData: CartItem[]) => {
    const storageKey = getStorageKey();
    const now = Date.now();
    
    // Evitar salvamentos muito frequentes (debounce de 500ms)
    if (now - lastSaveTime.current < 500) {
      // Cancelar salvamento anterior se existir
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Agendar novo salvamento
      saveTimeoutRef.current = setTimeout(() => {
        saveToStorage(cartData);
      }, 500);
      return;
    }
    
    lastSaveTime.current = now;
    
    if (cartData.length === 0) {
      localStorage.removeItem(storageKey);
      // Carrinho vazio removido
    } else {
      localStorage.setItem(storageKey, JSON.stringify(cartData));
      // Carrinho salvo
    }
  };

  // Salvar carrinho no localStorage sempre que mudar (APENAS DEPOIS DA INICIALIZAÇÃO)
  useEffect(() => {
    if (!isInitialized) return; // Não salvar durante a inicialização
    
    // Só salvar se a página estiver visível ou se for uma limpeza do carrinho
    if (isVisible || carrinho.length === 0) {
      saveToStorage(carrinho);
    }
  }, [carrinho, isInitialized, isVisible]);

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const limparCarrinho = () => {
    // Limpar estado React (o useEffect irá automaticamente atualizar o localStorage)
    setCarrinho([]);
  };

  return {
    carrinho,
    setCarrinho,
    isInitialized,
    limparCarrinho
  };
};