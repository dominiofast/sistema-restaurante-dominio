import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  showText?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text = 'Carregando...',
  showText = true
}) => {
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {/* Texto de carregamento sem animações */}
      {showText && (
        <div className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </div>
      )}
    </div>
  )
};

interface GlobalLoadingProps {
  message?: string;
  submessage?: string;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({ 
  message = 'Carregando...',
  submessage
}) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg text-gray-600 mb-2">{message}</div>
        {submessage && (
          <div className="text-sm text-gray-500">{submessage}</div>
        )}
      </div>
    </div>
  )
};

export default LoadingSpinner;
