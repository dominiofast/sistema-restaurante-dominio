
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Share2, ShoppingCart } from 'lucide-react';
import { PublicBrandingConfig } from '@/hooks/usePublicBranding';
import { CompanyLogo } from '@/components/loading';

interface CardapioHeaderProps {
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  branding: PublicBrandingConfig | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  primaryColor: string;
  textColor: string;


export const CardapioHeader: React.FC<CardapioHeaderProps> = ({
  company,
  branding,
  searchTerm,
  onSearchChange,
  primaryColor,
  textColor
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 p-1 flex items-center justify-center">
              <CompanyLogo
                logoUrl={branding?.logo_url}
                companyName={company?.name}
                size={32} // Tamanho reduzido para mobile: 32px, desktop: 40px
                className="header-logo max-w-full max-h-full"
                preserveAspectRatio={true}
                objectFit="contain"
                fallbackIcon={
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-lg sm:text-2xl">{company?.logo || '🍽️'}</span>
                  </div>
                }
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate" style={{ color: textColor }}>
                {company?.name}
              </h1>
              <p className="text-xs sm:text-sm opacity-70 hidden sm:block">Cardápio Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="sm:hidden">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Compartilhar</span>
            </Button>
            <Button 
              size="sm" 
              style={{ backgroundColor: primaryColor }}
              className="hover:opacity-90 hidden sm:inline-flex"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrinho
            </Button>
            <Button 
              size="sm" 
              style={{ backgroundColor: primaryColor }}
              className="hover:opacity-90 sm:hidden"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Carrinho</span>
            </Button>
          </div>
        </div>
        
        {/* Banner */}
        {branding?.show_banner && branding?.banner_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={branding.banner_url} 
              alt="Banner"
              className="w-full h-32 object-cover"
            />
          </div>
        )}
        
        {/* Busca */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>
    </header>
  )
};
