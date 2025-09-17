import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullscreenHeaderProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  primaryColor?: string;
  showBackButton?: boolean;
}

export const FullscreenHeader: React.FC<FullscreenHeaderProps> = ({
  title,
  onClose,
  onBack,
  primaryColor = '#f97316',
  showBackButton = false
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* Botão de voltar ou espaço vazio */}
        <div className="w-10 h-10 flex items-center justify-center">
          {showBackButton && onBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-10 w-10 p-0 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
          ) : null}
        </div>

        {/* Título centralizado */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            {title}
          </h1>
        </div>

        {/* Botão de fechar */}
        <div className="w-10 h-10 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};