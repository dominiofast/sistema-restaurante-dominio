import React from 'react';
import { Briefcase } from 'lucide-react';

export const InscricoesLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Briefcase className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Carregando inscrições...</p>
      </div>
    </div>
  )
};
