import React, { useEffect } from 'react';
import { FullscreenHeader } from './FullscreenHeader';
import { AddressSearchFlow } from '../pdv/AddressSearchFlow';
import { useFullscreenModal } from '@/hooks/useFullscreenModal';
import { CustomerAddress } from '@/types/address';

interface FullscreenAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: CustomerAddress) => void;
  customerName?: string;
  customerPhone?: string;
  primaryColor?: string;
}

export const FullscreenAddressModal: React.FC<FullscreenAddressModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  customerPhone,
  primaryColor = '#f97316'
}) => {
  const { animationState, headerConfig, setHeaderConfig, isVisible } = useFullscreenModal(isOpen);

  // Escutar evento customizado de fechar modal (ESC key)
  useEffect(() => {
    const handleCloseEvent = () => onClose();
    document.addEventListener('fullscreen-modal-close', handleCloseEvent);
    return () => document.removeEventListener('fullscreen-modal-close', handleCloseEvent);
  }, [onClose]);

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getAnimationClasses = () => {
    switch (animationState) {
      case 'entering':
        return 'animate-in slide-in-from-bottom duration-300';
      case 'entered':
        return '';
      case 'exiting':
        return 'animate-out slide-out-to-bottom duration-300';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Overlay de fundo */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Modal fullscreen */}
      <div 
        className={`fullscreen-modal fixed inset-0 z-50 bg-white flex flex-col ${getAnimationClasses()}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Header fixo */}
        <FullscreenHeader
          title={headerConfig.title}
          onClose={onClose}
          onBack={headerConfig.onBack}
          primaryColor={primaryColor}
          showBackButton={headerConfig.showBackButton}
        />

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <p id="modal-description" className="sr-only">
              Insira seu endereço para entrega do pedido
            </p>
            
            {/* Componente de busca de endereço adaptado */}
            <AddressSearchFlow
              isOpen={true} // Sempre true pois o modal já controla a visibilidade
              onClose={onClose}
              onConfirm={onConfirm}
              customerName={customerName}
              customerPhone={customerPhone}
              primaryColor={primaryColor}
              isFullscreen={true}
              onHeaderChange={setHeaderConfig}
            />
          </div>
        </div>
      </div>
    </>
  );
};