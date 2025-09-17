import React from 'react';
import { Truck, Zap } from 'lucide-react';
import { useDeliveryFreeConfig } from '@/hooks/useDeliveryFreeConfig';
import { usePublicBranding } from '@/hooks/usePublicBranding';

interface DeliveryFreeCardProps {
  companyId: string;
  companySlug?: string;
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const DeliveryFreeCard: React.FC<DeliveryFreeCardProps> = ({ 
  companyId, 
  companySlug,
  variant = 'full',
  className = '' 
}) => {
  const { deliveryStatus, loading } = useDeliveryFreeConfig(companyId);
  const { branding, loading: brandingLoading } = usePublicBranding({
    companyIdentifier: companySlug || companyId
  });

  // Debug para ver o que está acontecendo
  console.log('🚚 [DELIVERY CARD] Status:', {
    companyId,
    loading,
    brandingLoading,
    deliveryStatus,
    shouldShow: deliveryStatus.hasFreeDelivery && !loading && !brandingLoading
  });

  // Se não há entrega grátis ou está carregando, não renderiza
  if (!deliveryStatus.hasFreeDelivery || loading || brandingLoading) {
    console.log('🚚 [DELIVERY CARD] Não renderizando:', {
      hasFreeDelivery: deliveryStatus.hasFreeDelivery,
      loading,
      brandingLoading
    });
    return null;
  }

  // Cores da marca ou padrão verde
  const primaryColor = branding?.primary_color || '#22c55e';
  const accentColor = branding?.accent_color || '#16a34a';
  const textColor = branding?.text_color || '#1F2937';

  // Função para criar gradiente baseado na cor primária
  const createGradient = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const lighterR = Math.min(255, r + 30);
    const lighterG = Math.min(255, g + 30);
    const lighterB = Math.min(255, b + 30);
    
    const darkerR = Math.max(0, r - 20);
    const darkerG = Math.max(0, g - 20);
    const darkerB = Math.max(0, b - 20);
    
    return `linear-gradient(135deg, rgb(${lighterR}, ${lighterG}, ${lighterB}) 0%, rgb(${darkerR}, ${darkerG}, ${darkerB}) 100%)`;
  };

  // Função para determinar se a cor é clara ou escura
  const isLightColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const isDark = !isLightColor(primaryColor);
  const contrastColor = isDark ? '#FFFFFF' : textColor;

  // Determinar texto baseado no status
  const getDeliveryText = () => {    
    if (deliveryStatus.allRegionsFree) {
      return {
        title: 'Entrega grátis',
        subtitle: 'em todas as regiões'
      };
    } else {
      return {
        title: 'Entrega grátis',
        subtitle: 'em algumas regiões'
      };
    }
  };

  const deliveryText = getDeliveryText();

  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm ${className}`}
        style={{
          background: createGradient(primaryColor),
          color: contrastColor
        }}
      >
        <Truck className="w-4 h-4" />
        <span className="text-sm font-medium">
          {deliveryText.title}
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div 
        className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${className}`}
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
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-base" style={{ color: textColor }}>
              {deliveryText.title}
            </h3>
            <p className="text-sm" style={{ color: `${textColor}99` }}>
              {deliveryText.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4" style={{ color: primaryColor }} />
          <span className="text-xs font-medium" style={{ color: primaryColor }}>
            GRÁTIS
          </span>
        </div>
      </div>
    );
  }

  // Variant full (padrão) - melhor design inspirado na referência
  return (
    <div 
      className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}
      style={{
        background: createGradient(primaryColor),
        boxShadow: `0 4px 20px ${primaryColor}20`
      }}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20"
          >
            <Truck className="w-6 h-6" style={{ color: contrastColor }} />
          </div>
          
          <div>
            <h3 className="font-bold text-lg" style={{ color: contrastColor }}>
              {deliveryText.title}
            </h3>
            <p className="text-sm" style={{ color: `${contrastColor}CC` }}>
              {deliveryText.subtitle}
            </p>
            <p className="text-xs mt-1" style={{ color: `${contrastColor}99` }}>
              Faça já o seu pedido!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div 
            className="flex items-center justify-center w-16 h-16 rounded-full"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : accentColor,
            }}
          >
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-1" style={{ color: contrastColor }} />
              <span className="text-xs font-bold" style={{ color: contrastColor }}>
                GRÁTIS
              </span>
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