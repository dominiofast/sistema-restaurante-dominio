import { useState, useEffect } from 'react';

/**
 * Hook para detectar quando a página está visível ou oculta
 * Útil para evitar recarregamentos desnecessários quando o usuário volta para a aba
 */
export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [wasHidden, setWasHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      
      if (!visible) {
        setWasHidden(true);
      }
      
      setIsVisible(visible);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Função para resetar o estado de "foi oculto"
  const resetWasHidden = () => setWasHidden(false);

  return { isVisible, wasHidden, resetWasHidden };
};