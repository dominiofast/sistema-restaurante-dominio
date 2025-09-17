import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, ShoppingCart } from 'lucide-react';
import { PublicBrandingConfig } from '@/hooks/usePublicBranding';
import { CompanyLogo } from '@/components/loading';

interface CompanyBrandingProps {
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  branding: PublicBrandingConfig | null;
  primaryColor: string;
  textColor: string;
  onCartClick?: () => void;
  cartItemCount?: number;
}

export const CompanyBranding: React.FC<CompanyBrandingProps> = ({
  company,
  branding,
  primaryColor,
  textColor,
  onCartClick,
  cartItemCount = 0
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${company?.name} - Cardápio Digital`,
          text: `Confira o cardápio digital da ${company?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback para cópia do link
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      // Você pode adicionar um toast aqui
      console.log('Link copiado para a área de transferência');
    });
  };

  return (
    <div className="flex items-center justify-between mb-4 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Logo com container flexível */}
        <div className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 p-1 flex items-center justify-center">
          <CompanyLogo
            logoUrl={branding?.logo_url}
            companyName={company?.name}
            size={40} // Tamanho reduzido para mobile: 40px, desktop: 56px
            className="branding-logo max-w-full max-h-full"
            preserveAspectRatio={true}
            objectFit="contain"
            fallbackIcon={
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-xl sm:text-3xl">{company?.logo || '🍽️'}</span>
              </div>
            }
          />
        </div>
        
        {/* Company Info */}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-3xl font-bold truncate mb-1" style={{ color: textColor }}>
            {company?.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
            Cardápio Digital
          </p>
          <p className="text-xs text-gray-500 sm:hidden">
            Cardápio Digital
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Share Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="hidden sm:inline-flex hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="sm:hidden hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Compartilhar</span>
        </Button>
        
        {/* Cart Button */}
        <Button 
          size="sm" 
          onClick={onCartClick}
          style={{ backgroundColor: primaryColor }}
          className="hover:opacity-90 hidden sm:inline-flex relative"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Carrinho
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          )}
        </Button>
        <Button 
          size="sm" 
          onClick={onCartClick}
          style={{ backgroundColor: primaryColor }}
          className="hover:opacity-90 sm:hidden relative"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Carrinho</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};