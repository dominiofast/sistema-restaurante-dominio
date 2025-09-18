import React from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { useCashbackConfig } from '@/hooks/useCashbackConfig';

interface CashbackFloatingTipProps {
  companyId: string;
  primaryColor?: string;
  className?: string;
}

export const CashbackFloatingTip: React.FC<CashbackFloatingTipProps> = ({ 
  companyId,
  primaryColor = '#3B82F6',
  className = '' 
}) => {
  const { data: cashbackConfig, isLoading } = useCashbackConfig(companyId)

  // Se não há configuração ou não está ativo, não renderiza
  if (!cashbackConfig || !cashbackConfig.is_active || isLoading) {
    return null;
  }

  const percentual = Number(cashbackConfig.percentual_cashback)

  return (
    <div className={`fixed bottom-20 right-4 z-40 ${className}`}>
      <div 
        className="bg-white rounded-xl shadow-lg border-2 p-3 max-w-xs animate-bounce"
        style={{ borderColor: primaryColor }}
      >
        <div className="flex items-start gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <Gift className="w-4 h-4" style={{ color: primaryColor }} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" style={{ color: primaryColor }} />
              <span className="text-xs font-bold" style={{ color: primaryColor }}>
                Cashback {percentual.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-tight">
              Ganhe dinheiro de volta em cada compra!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
};
