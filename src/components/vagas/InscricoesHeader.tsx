
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InscricoesHeaderProps {
  currentCompanyName?: string;
  onRefresh?: () => void;
}

export const InscricoesHeader: React.FC<InscricoesHeaderProps> = ({ 
  currentCompanyName, 
  onRefresh 
}) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
          Inscrições Recebidas
        </h1>
        {currentCompanyName && (
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
            {currentCompanyName}
          </p>
        )}
      </div>
      
      {onRefresh && (
        <div className="flex-shrink-0">
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </Button>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="sm:hidden"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Recarregar</span>
          </Button>
        </div>
      )}
    </div>
  )
};
