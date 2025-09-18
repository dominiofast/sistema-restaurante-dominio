import React, { useState, useEffect } from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { useCashbackConfig } from '@/hooks/useCashbackConfig';

interface CashbackHeaderProps {
  companyId: string;
  primaryColor?: string;
  textColor?: string;
  className?: string;
}

export const CashbackHeader: React.FC<CashbackHeaderProps> = ({ 
  companyId, 
  primaryColor = '#3B82F6',
  textColor = '#1F2937',
  className = '' 
}) => {
  const { data: cashbackConfig, isLoading } = useCashbackConfig(companyId);
  const [showPulse, setShowPulse] = useState(true);

  // Se não há configuração ou não está ativo, não renderiza
  if (!cashbackConfig || !cashbackConfig.is_active || isLoading) {
    return null;
  }

  const percentual = Number(cashbackConfig.percentual_cashback);

  // Remover pulse após 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {;
      setShowPulse(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl p-5 mb-6 shadow-sm border-0 ${className}`}
      style={{ 
        background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
      }}
    >
      {/* Padrão de fundo sutil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/20"></div>
        <div className="absolute bottom-2 left-6 w-16 h-16 rounded-full bg-white/10"></div>
        <div className="absolute top-8 left-1/3 w-12 h-12 rounded-full bg-white/15"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Ganhe Cashback
            </h3>
            <p className="text-sm text-white/90 font-medium">
              Receba de volta em todas as compras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl font-bold text-white leading-none">
              {percentual.toFixed(0)}%
            </div>
            <div className="text-xs text-white/80 font-medium">
              de volta
            </div>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};