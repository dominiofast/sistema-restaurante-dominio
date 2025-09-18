import { useEffect, useRef } from 'react';

/**
 * SOLUÇÃO PROFISSIONAL: Hook para limpeza robusta de autenticação
 * - Cleanup completo de localStorage/sessionStorage
 * - Gerenciamento de subscriptions e timeouts
 * - Prevenção de vazamentos de memória
 */

// Função utilitária para limpeza completa do estado de auth
export const cleanupAuthState = () => {
  console.log('🧹 Iniciando limpeza completa do estado de autenticação...');
  
  // Limpar todas as chaves do Supabase no localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('/* supabase REMOVIDO */ null; //auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removido localStorage: ${key}`);
    }
  });

  // Limpar sessionStorage se existir
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('/* supabase REMOVIDO */ null; //auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Removido sessionStorage: ${key}`);
      }
    });
  }

  console.log('✅ Limpeza de autenticação concluída');
};

export const useAuthCleanup = () => {
  const mountedRef = useRef(true);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const subscriptionsRef = useRef<Set<any>>(new Set());

  // Função para registrar timeouts
  const registerTimeout = (timeout: NodeJS.Timeout) => {
    timeoutsRef.current.add(timeout);
    return timeout;
  };

  // Função para registrar subscriptions
  const registerSubscription = (subscription: any) => {
    subscriptionsRef.current.add(subscription);
    return subscription;
  };

  // Função para limpar um timeout específico
  const clearRegisteredTimeout = (timeout: NodeJS.Timeout) => {
    clearTimeout(timeout);
    timeoutsRef.current/* .delete\( REMOVIDO */ ; //timeout);
  };

  // Função para limpar uma subscription específica
  const clearRegisteredSubscription = (subscription: any) => {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
    subscriptionsRef.current/* .delete\( REMOVIDO */ ; //subscription);
  };

  // Função para verificar se o componente ainda está montado
  const isMounted = () => mountedRef.current;

  // Cleanup automático quando o componente é desmontado
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      // Limpar todos os timeouts registrados
      timeoutsRef.current.forEach(timeout => {
        clearTimeout(timeout);
      });
      timeoutsRef.current.clear();

      // Limpar todas as subscriptions registradas
      subscriptionsRef.current.forEach(subscription => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  return {
    isMounted,
    registerTimeout,
    registerSubscription,
    clearRegisteredTimeout,
    clearRegisteredSubscription,
    mountedRef
  };
};