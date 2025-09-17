import { useState, useEffect } from 'react';

type AnimationState = 'entering' | 'entered' | 'exiting' | 'exited';

interface HeaderConfig {
  title: string;
  showBackButton: boolean;
  onBack?: () => void;
}

export const useFullscreenModal = (isOpen: boolean) => {
  const [animationState, setAnimationState] = useState<AnimationState>('exited');
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: 'Novo Endereço',
    showBackButton: false
  });

  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      // Pequeno delay para permitir que o DOM seja atualizado
      const timer = setTimeout(() => setAnimationState('entered'), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
      const timer = setTimeout(() => setAnimationState('exited'), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Gerenciar foco quando modal abre
  useEffect(() => {
    if (animationState === 'entered') {
      // Focar no primeiro elemento interativo
      const firstInput = document.querySelector('.fullscreen-modal input') as HTMLElement;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [animationState]);

  // Suporte a tecla ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && animationState === 'entered') {
        // Disparar evento customizado para fechar modal
        const closeEvent = new CustomEvent('fullscreen-modal-close');
        document.dispatchEvent(closeEvent);
      }
    };

    if (animationState === 'entered') {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [animationState]);

  return {
    animationState,
    headerConfig,
    setHeaderConfig,
    isVisible: animationState !== 'exited'
  };
};