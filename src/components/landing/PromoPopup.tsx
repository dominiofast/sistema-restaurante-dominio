// Popup removido - componente desabilitado para melhorar UX
import React from 'react';

interface PromoPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const PromoPopup: React.FC<PromoPopupProps> = () => {
  // Popup foi desabilitado - retorna null para não renderizar nada
  return null;
};
