import React from 'react';
import { Coins } from 'lucide-react';
import { useCashbackConfig } from '@/hooks/useCashbackConfig';

interface CashbackInlineProps {
  companyId: string;
  productPrice: number;
  primaryColor?: string;
  className?: string;
}

export const CashbackInline: React.FC<CashbackInlineProps> = ({ 
  companyId,
  productPrice,
  primaryColor = '#3B82F6',
  className = '' 
}) => {
  const { data: cashbackConfig, isLoading } = useCashbackConfig(companyId);

  // Se não há configuração ou não está ativo, não renderiza
  if (!cashbackConfig || !cashbackConfig.is_active || isLoading || productPrice <= 0) {
    return null;
  }

  const percentual = Number(cashbackConfig.percentual_cashback);
  const cashbackValue = (productPrice * percentual) / 100;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Coins className="w-3 h-3 text-white" />
      <span 
        className="text-xs font-medium text-white"
      >
        Ganhe R$ {cashbackValue.toFixed(2).replace('.', ',')} de volta
      </span>
    </div>
  );
};