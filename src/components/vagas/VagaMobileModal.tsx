
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import FormularioInscricao from './FormularioInscricao';

interface VagaMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaga: {
    id: string;
    titulo: string;
    company_id: string;
  };
  primaryColor?: string;
}

const VagaMobileModal: React.FC<VagaMobileModalProps> = ({
  isOpen,
  onClose,
  vaga,
  primaryColor = '#1B365D'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-white border-gray-200">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {vaga.titulo}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] bg-white">
          <FormularioInscricao
            vagaId={vaga.id}
            companyId={vaga.company_id}
            vagaTitulo={vaga.titulo}
            primaryColor={primaryColor}
            onSuccess={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VagaMobileModal;
