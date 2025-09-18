import React from 'react';
import { Gift, Star } from 'lucide-react';
import { LoyaltyProgramConfig } from '@/types/cardapio';

interface LoyaltyProgramBannerProps {
  loyaltyConfig: LoyaltyProgramConfig;
  primaryColor: string;
}

export const LoyaltyProgramBanner: React.FC<LoyaltyProgramBannerProps> = ({
  loyaltyConfig,
  primaryColor
}) => {
  if (!loyaltyConfig.enabled) return null;

  const { points_per_real, points_to_redeem, reward_value } = loyaltyConfig;

  return (
    <div className="mb-4 p-4 rounded-lg border-2" style={{ 
      borderColor: primaryColor, 
      backgroundColor: `${primaryColor}08`,
      background: `linear-gradient(135deg, ${primaryColor}08 0%, ${primaryColor}15 100%)`
    }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <Gift className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: primaryColor }}>
              Programa de Fidelidade
            </h3>
            <p className="text-sm text-gray-600">
              A cada R$ 1,00 em compras você ganha {points_per_real} {points_per_real === 1 ? 'ponto' : 'pontos'}
            </p>
          </div>
        </div>
        
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-4 w-4" style={{ color: primaryColor }} />
            <span className="text-sm font-semibold" style={{ color: primaryColor }}>
              {points_to_redeem} pontos
            </span>
          </div>
          <p className="text-xs text-gray-600">
            = R$ {reward_value.toFixed(2)} de desconto
          </p>
        </div>
      </div>
      
      {/* Mobile version of points info */}
      <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" style={{ color: primaryColor }} />
            <span className="text-sm font-semibold" style={{ color: primaryColor }}>
              {points_to_redeem} pontos
            </span>
          </div>
          <p className="text-sm text-gray-600">
            R$ {reward_value.toFixed(2)} de desconto
          </p>
        </div>
      </div>
    </div>
  )
};
