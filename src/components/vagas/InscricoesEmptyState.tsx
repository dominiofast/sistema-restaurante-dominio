import React from 'react';
import { Mail } from 'lucide-react';

export const InscricoesEmptyState: React.FC = () => {
  return (
    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
      <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Nenhuma inscrição recebida
      </h3>
      <p className="text-gray-600">
        As inscrições aparecerão aqui quando candidatos se inscreverem nas vagas
      </p>
    </div>
  )
};
