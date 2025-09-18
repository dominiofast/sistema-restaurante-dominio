import React from 'react';
import { Produto } from '@/types/cardapio';
import UnifiedProductModal from './UnifiedProductModal';

interface MobileProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: Produto;
  onAdvance: (produto: Produto, adicionais: { [adicionalId: string]: number }, observacoes?: string) => void;
  primaryColor?: string;
  companyId?: string;
}

const MobileProductModal: React.FC<MobileProductModalProps> = (props) => {
  return <UnifiedProductModal {...props} />;
};

export default MobileProductModal;
