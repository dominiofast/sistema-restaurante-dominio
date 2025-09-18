import React from 'react';
import { Wallet } from 'lucide-react';

interface CashbackDisplayProps {
  saldoDisponivel: number;
  percentual?: number;
  showBalance?: boolean;
  showPercentage?: boolean;
  className?: string;
}

export const CashbackDisplay: React.FC<CashbackDisplayProps> = ({
  saldoDisponivel,
  percentual,
  showBalance = true,
  showPercentage = true,
  className = ''
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL';
    }).format(value)
  };

  if (!showBalance && !showPercentage) return null;

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-green-800">
          Sistema de Cashback
        </span>
      </div>
      
      <div className="space-y-1">
        {showBalance && (
          <div className="text-xs text-green-700">
            Saldo disponível: <span className="font-bold">{formatCurrency(saldoDisponivel)}</span>
          </div>
        )}
        
        {showPercentage && percentual && (
          <div className="text-xs text-green-700">
            Ganhe <span className="font-bold">{percentual}%</span> de volta em suas compras
          </div>
        )}
      </div>
    </div>
  )
};
