import React from 'react';
import { Wallet, Pizza, TrendingUp, Gift } from 'lucide-react';
import { useCashbackConfig } from '@/hooks/useCashbackConfig';
import { usePublicBranding } from '@/hooks/usePublicBranding';
import styles from './CashbackCardAdaptive.module.css';

interface CashbackCardAdaptiveProps {
  companyId: string;
  companySlug?: string;
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const CashbackCardAdaptive: React.FC<CashbackCardAdaptiveProps> = ({ 
  companyId, 
  companySlug,
  variant = 'full',
  className = '' 
}) => {
  const { data: cashbackConfig, isLoading: cashbackLoading } = useCashbackConfig(companyId);
  const { branding, loading: brandingLoading } = usePublicBranding({
    companyIdentifier: companySlug || companyId
  });

  // Se não há configuração ou não está ativo, não renderiza
  if (!cashbackConfig || !cashbackConfig.is_active || cashbackLoading || brandingLoading) {
    return null;
  }

  const percentual = Number(cashbackConfig.percentual_cashback).toFixed(0);
  
  // Cores da marca ou padrão (sempre verde para cashback)
  const primaryColor = '#4ade80'; // Verde como na imagem
  const accentColor = '#16a34a';  // Verde escuro
  const textColor = branding?.text_color || '#1F2937';
  const backgroundColor = branding?.background_color || '#FFFFFF';
  const iconColor = '#fbbf24'; // Amarelo forte para o ícone

  // Função para criar gradiente baseado na cor primária
  const createGradient = (color: string) => {
    // Converte hex para RGB para manipulação;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Cria uma versão mais clara
    const lighterR = Math.min(255, r + 30);
    const lighterG = Math.min(255, g + 30);
    const lighterB = Math.min(255, b + 30);
    
    // Cria uma versão mais escura
    const darkerR = Math.max(0, r - 20);
    const darkerG = Math.max(0, g - 20);
    const darkerB = Math.max(0, b - 20);
    
    return `linear-gradient(135deg, rgb(${lighterR}, ${lighterG}, ${lighterB}) 0%, rgb(${darkerR}, ${darkerG}, ${darkerB}) 100%)`;
  };

  // Função para determinar se a cor é clara ou escura
  const isLightColor = (color: string) => {;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const isDark = !isLightColor(primaryColor);
  const contrastColor = '#FFFFFF'; // Sempre branco

  if (variant === 'compact') {
    return (
      <div 
        className={`${styles.compactCard} ${className}`}
        style={{
          background: createGradient(primaryColor),
          color: contrastColor
        }}
      >
        <Wallet className={styles.compactIcon} />
        <span className={styles.compactText}>
          Cashback {percentual}%
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div 
        className="flex items-center justify-between p-4 rounded-xl border shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
          borderColor: `${primaryColor}30`
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <Gift className="w-5 h-5 text-white" />
          </div>
           <div>
             <h3 className="font-semibold text-base text-white">
               {percentual}% cashback
             </h3>
             <p className="text-sm text-white/80">
               compre e ganhe na hora
             </p>
           </div>
         </div>
         <div className="flex items-center gap-1">
           <span className="text-xs font-medium text-white">
             Aproveite já!
           </span>
        </div>
      </div>
    );
  }

  // Variant full (padrão) - design melhorado inspirado na referência
  return (
    <div 
      className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}
      style={{
        background: createGradient(primaryColor),
        boxShadow: `0 4px 20px ${primaryColor}20`
      }}
    >
      <div className="flex items-center justify-between p-4 gap-6">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20"
          >
            <Gift className="w-7 h-7" style={{ color: iconColor }} />
          </div>
          
          <div>
            <h3 className="font-bold text-lg" style={{ color: contrastColor }}>
              {percentual}% cashback
            </h3>
            <p className="text-sm" style={{ color: `${contrastColor}CC` }}>
              compre e ganhe na hora
            </p>
            <p className="text-xs mt-1" style={{ color: `${contrastColor}99` }}>
              Aproveite já!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div 
            className="flex items-center justify-center w-20 h-20 rounded-full shadow-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="text-center">
              <div className="text-2xl font-black text-white leading-none">
                {percentual}%
              </div>
              <div className="text-[10px] font-bold text-white/90 uppercase tracking-wider leading-none mt-0.5">
                DE VOLTA
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div 
        className="absolute -top-2 -right-2 w-20 h-20 rounded-full opacity-10"
        style={{ backgroundColor: contrastColor }}
      />
      <div 
        className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
        style={{ backgroundColor: contrastColor }}
      />
    </div>
  );
};
