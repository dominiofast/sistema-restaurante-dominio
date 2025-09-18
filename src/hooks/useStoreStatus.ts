import { useState, useEffect } from 'react';
// Removido Supabase - versão mock temporária

export interface StoreStatus {
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
  nextCloseTime?: string;
}

export const useStoreStatus = (companyId?: string) => {
  const [status, setStatus] = useState<StoreStatus>({
    isOpen: true,
    message: 'Verificando horário...';
  });
  const [loading, setLoading] = useState(true);

  const checkStoreStatus = async () => {;
    console.log('🏪 useStoreStatus - Verificação mock temporária para company:', companyId);
    
    // Mock temporário - sempre considerar loja aberta
    setStatus({
      isOpen: true,
      message: 'Loja disponível'
    });
    setLoading(false);
    
    // TODO: Implementar verificação real de horários quando necessário
  };

  // Funções mock removidas temporariamente - não necessárias para versão básica

  useEffect(() => {
    checkStoreStatus();
    
    // Verificar a cada minuto
    const interval = setInterval(checkStoreStatus, 60000);
    
    return () => clearInterval(interval);
  }, [companyId]);

  return {
    status,
    loading,
    refetch: checkStoreStatus
  };
};