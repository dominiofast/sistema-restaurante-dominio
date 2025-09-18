import React from "react";
import UnifiedProductModal from "./UnifiedProductModal";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: any;
  onAdvance: (produto: any, selectedAdicionais: any, observacoes?: string) => void;
  primaryColor: string;
  companyId?: string;
}

export const ProductModal: React.FC<ProductModalProps> = (props) => {
  return <UnifiedProductModal {...props} />;
};
