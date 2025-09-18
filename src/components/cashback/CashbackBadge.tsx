import React from 'react';
import { Gift } from 'lucide-react';

interface CashbackBadgeProps {
  percentual: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CashbackBadge: React.FC<CashbackBadgeProps> = ({
  percentual,
  size = 'sm',
  className = ''
}) => {
  const sizeConfig = {
    sm: {
      container: 'px-3 py-2 gap-2',
      icon: 'h-3 w-3',
      text: 'text-xs',
      percentage: 'text-sm font-bold'
    },
    md: {
      container: 'px-4 py-3 gap-3',
      icon: 'h-4 w-4',
      text: 'text-sm',
      percentage: 'text-lg font-bold'
    },
    lg: {
      container: 'px-6 py-4 gap-4',
      icon: 'h-5 w-5',
      text: 'text-base',
      percentage: 'text-xl font-bold'
    };
  };

  const config = sizeConfig[size];

  if (size === 'sm') {
    return (
      <div 
        className={`inline-flex items-center justify-center bg-emerald-500 text-white font-semibold rounded-lg px-2 py-1 ${className}`}
      >
        <span className="text-xs">cashback {percentual}%</span>
      </div>
    )
  }

  return (
    <div 
      className={`inline-flex items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl ${config.container} ${className}`}
    >
      {/* Lado esquerdo com ícone e texto */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center bg-emerald-500 rounded-lg p-1.5">
          <Gift className={`${config.icon} text-white`} />
        </div>
        <span className={`${config.text} font-medium text-emerald-800`}>
          Ganhe Cashback
        </span>
      </div>
      
      {/* Lado direito com percentual destacado */}
      <div className="flex items-center">
        <span className={`${config.percentage} text-emerald-700`}>
          {percentual}%
        </span>
      </div>
    </div>
  )
};
