import { useState, useEffect, useRef } from 'react';
import { usePageVisibility } from './usePageVisibility';

interface ClienteData {
  nome: string;
  telefone: string;
  endereco: string;
  entrega: string;
  pagamento: string;
  taxaEntrega: number;
}

/**
 * Hook para persistir dados do cliente no PDV de forma otimizada
 * Evita perda de dados ao alternar abas e reduz operações desnecessárias
 */
export const useClientePersistence = (companyId?: string) => {
  const [cliente, setCliente] = useState<ClienteData>(() => {
    // Inicializar com dados padrão
    return {
      nome: '',
      telefone: '',
      endereco: '',
      entrega: 'balcao',
      pagamento: 'dinheiro',
      taxaEntrega: 0
    };
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const { isVisible } = usePageVisibility();
  const lastSaveTime = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getStorageKey = () => {
    return `pdv_cliente_${companyId || 'default'}`;
  };

  // Função de salvamento otimizada com debounce
  const saveToStorage = (clienteData: ClienteData) => {
    const storageKey = getStorageKey();
    const now = Date.now();
    
    // Evitar salvamentos muito frequentes (debounce de 1 segundo)
    if (now - lastSaveTime.current < 1000) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveToStorage(clienteData);
      }, 1000);
      return;
    }
    
    lastSaveTime.current = now;
    
    // Só salvar se houver dados relevantes
    const hasData = clienteData.nome || clienteData.telefone || clienteData.endereco;
    
    if (hasData) {
      localStorage.setItem(storageKey, JSON.stringify(clienteData));
      console.log('👤 Dados do cliente salvos no localStorage');
    } else {
      localStorage.removeItem(storageKey);
      console.log('👤 Dados do cliente removidos do localStorage (vazios)');
    }
  };

  // Carregar dados do cliente na inicialização
  useEffect(() => {
    if (isInitialized || !companyId) return;
    
    const storageKey = getStorageKey();
    const savedCliente = localStorage.getItem(storageKey);
    
    if (savedCliente) {
      try {
        const parsedCliente = JSON.parse(savedCliente);
        console.log('👤 Dados do cliente carregados do localStorage');
        setCliente(parsedCliente);
      } catch (error) {
        console.error('❌ Erro ao carregar dados do cliente:', error);
        localStorage.removeItem(storageKey);
      }
    }
    
    setIsInitialized(true);
  }, [companyId, isInitialized]);

  // Salvar dados do cliente sempre que mudarem
  useEffect(() => {
    if (!isInitialized) return;
    
    // Só salvar se a página estiver visível ou se for uma limpeza
    if (isVisible || (!cliente.nome && !cliente.telefone && !cliente.endereco)) {
      saveToStorage(cliente);
    }
  }, [cliente, isInitialized, isVisible]);

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const limparCliente = () => {
    console.log('🗑️ Limpando dados do cliente...');
    setCliente({
      nome: '',
      telefone: '',
      endereco: '',
      entrega: 'balcao',
      pagamento: 'dinheiro',
      taxaEntrega: 0
    });
  };

  const updateCliente = (updates: Partial<ClienteData>) => {
    setCliente(prev => ({ ...prev, ...updates }));
  };

  return {
    cliente,
    setCliente,
    updateCliente,
    limparCliente,
    isInitialized
  };
};
