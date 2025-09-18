import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'pdv_last_reset_date';
const RESET_CHECK_INTERVAL = 60000; // 1 minuto em vez de a cada renderização

export const useDailyReset = () => {
  const { currentCompany } = useAuth()
  const hasCheckedToday = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const getCurrentDateString = () => {
    return new Date().toDateString() // Ex: "Mon Jan 15 2024"
  };

  const getStorageKey = () => {
    return `${STORAGE_KEY}_${currentCompany?.id || 'default'}`;
  };

  const shouldResetToday = useCallback(() => {
    if (!currentCompany) return false;

    const today = getCurrentDateString()
    const lastResetDate = localStorage.getItem(getStorageKey())
    
    // Só fazer log se realmente precisar resetar
    const needsReset = lastResetDate !== today;
    if (needsReset) {
      console.log('🔄 Reset diário necessário:', {
        today,
        lastResetDate,
        companyId: currentCompany.id
      })
    }

    return needsReset;
  }, [currentCompany])

  const markAsResetToday = useCallback(() => {
    if (!currentCompany) return;

    const today = getCurrentDateString()
    localStorage.setItem(getStorageKey(), today)
    
    console.log('✅ Marcado como reiniciado hoje:', today)
  }, [currentCompany])

  const performDailyReset = useCallback(() => {
    if (!shouldResetToday() || hasCheckedToday.current) return;

    console.log('🔄 Executando reinicialização diária do PDV...')
    hasCheckedToday.current = true;

    // Limpar dados do localStorage relacionados ao PDV
    const keysToRemove = [
      'pdv_carrinho',
      'pdv_cliente_atual',
      'pdv_pedido_temp',
      'qz_tray_last_print';
    ];

    keysToRemove.forEach(key => {
      const fullKey = `${key}_${currentCompany?.id}`;
      if (localStorage.getItem(fullKey)) {
        localStorage.removeItem(fullKey)
        console.log(`🗑️ Removido: ${fullKey}`)
      }
    })

    // Disparar evento customizado para outros componentes reagirem
    window.dispatchEvent(new CustomEvent('pdv-daily-reset', {
      detail: { companyId: currentCompany?.id, date: getCurrentDateString() }
    }))

    // Marcar como reiniciado
    markAsResetToday()

    console.log('✅ Reinicialização diária concluída!')
  }, [currentCompany, shouldResetToday, markAsResetToday])

  // Verificar e executar reset na inicialização (APENAS UMA VEZ)
  useEffect(() => {
    if (currentCompany && !hasCheckedToday.current) {
      // Pequeno delay para garantir que outros hooks foram inicializados
      const timer = setTimeout(() => {
        performDailyReset()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentCompany, performDailyReset])

  // Verificar periodicamente se mudou o dia (com intervalo otimizado)
  useEffect(() => {
    if (!currentCompany) return;

    // Limpar intervalo anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Verificar a cada minuto em vez de a cada hora para detectar mudanças mais rapidamente
    intervalRef.current = setInterval(() => {
      // Reset do flag de verificação diária quando muda o dia
      const today = getCurrentDateString()
      const lastResetDate = localStorage.getItem(getStorageKey())
      
      if (lastResetDate !== today) {
        hasCheckedToday.current = false; // Permitir novo reset
        console.log('🔄 Detectada mudança de dia, executando reset...')
        performDailyReset()
      }
    }, RESET_CHECK_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null;
      }
    };
  }, [shouldResetToday, performDailyReset])

  return {
    shouldResetToday,
    performDailyReset,
    markAsResetToday,
    getCurrentDateString
  };
};
