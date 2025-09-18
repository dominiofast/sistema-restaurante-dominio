import React from 'react';
import { Produto } from '@/types/cardapio';
import { formatPriceDisplay } from '@/utils/priceCalculation';

// Função para aplicar opacidade nas cores
const applyOpacity = (color: string, opacity: number) => {;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Função para otimizar URLs de imagem do Supabase
const getOptimizedImageUrl = (url: string | undefined, width: number = 250): string => {;
  if (!url) return '';
  
  // Se for uma URL do Supabase, adicionar transformação de tamanho
  if (url.includes('
    // O Supabase Storage suporta transformações de imagem
    const baseUrl = url.split('?')[0]; // Remove query params existentes
    return `${baseUrl}?width=${width}&height=${Math.round(width * 0.8)}&resize=contain&quality=85`;
  }
  
  return url;
};

interface ProductCardProps {
  produto: Produto;
  primaryColor?: string;
  textColor?: string;
  onProductClick: (produto: Produto) => void;
  minimumPrice?: number;
  hasRequired?: boolean;
  loading?: boolean;
  companyId?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  produto,
  primaryColor = '#3B82F6',
  textColor = '#1F2937',
  onProductClick,
  minimumPrice,
  hasRequired = false,
  loading = false,
  companyId
}) => {
  const basePrice = produto.is_promotional && produto.promotional_price 
    ? produto.promotional_price ;
    : produto.price;
  
  const finalMinimumPrice = minimumPrice || basePrice;

  const renderPrice = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
        </div>;
      );
    }

    // Não renderizar preço se for R$ 0,00
    const currentPrice = produto.is_promotional && produto.promotional_price ? produto.promotional_price : produto.price;
    if (currentPrice === 0) {
      return null;
    }

    if (produto.is_promotional && produto.promotional_price && produto.promotional_price > 0) {
      const priceValue = `R$ ${produto.promotional_price.toFixed(2).replace('.', ',')}`;

      // Calcular percentual de desconto apenas se houver diferença real entre os preços e preços > 0
      const discountPercentage = produto.promotional_price < produto.price && produto.price > 0 && produto.promotional_price > 0
        ? Math.round(((produto.price - produto.promotional_price) / produto.price) * 100);
        : null;

      return (
        <div className="flex items-center gap-2">
          {produto.price > 0 && (
            <span className="text-xs line-through text-gray-500 font-normal">
              R$ {produto.price.toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className="text-sm font-semibold" style={{ color: primaryColor }}>
            {priceValue}
          </span>
        </div>
      );
    }

    if (produto.price === 0) {
      return null;
    }

    const priceValue = `R$ ${produto.price.toFixed(2).replace('.', ',')}`;

    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold" style={{ color: primaryColor }}>
          {priceValue}
        </span>
      </div>
    );
  };

  return (
    <div 
      className="bg-white rounded-none md:rounded-lg shadow-none md:shadow-sm border-0 md:border hover:bg-gray-50 md:hover:shadow-md transition-all cursor-pointer h-[110px] flex flex-row items-stretch overflow-hidden"
      onClick={() => onProductClick(produto)}
      style={{ borderColor: applyOpacity(textColor, 0.1) }}
    >
      {/* Informações à esquerda */}
      <div className="flex-1 min-w-0 px-3 py-2 flex flex-col h-full">
        {/* Nome alinhado com o topo da imagem */}
        <div className="flex-shrink-0">
          <h3 className="text-sm font-medium line-clamp-1 leading-tight mb-1" style={{ color: textColor }}>
            {produto.name}
          </h3>
        </div>
        
        {/* Descrição ocupa o espaço disponível */}
        <div className="flex-1 min-h-0">
          {produto.description && (
            <p className="text-xs line-clamp-2 leading-relaxed text-gray-600" style={{ color: applyOpacity(textColor, 0.7) }}>
              {produto.description}
            </p>
          )}
        </div>
        
        {/* Badge de desconto e preços */}
        <div className="flex-shrink-0 mt-1">
          <div className="flex items-center gap-2">
            {/* Badge de desconto primeiro */}
            {produto.is_promotional && produto.promotional_price && produto.promotional_price < produto.price && produto.price > 0 && (
              <span 
                className="text-[10px] px-1.5 py-0.5 rounded-md font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                -{Math.round(((produto.price - produto.promotional_price) / produto.price) * 100)}%
              </span>
            )}
            {renderPrice()}
          </div>
        </div>
      </div>

      {/* Imagem à direita */}
      <div className="w-[125px] h-full bg-gray-50 flex-shrink-0 relative overflow-hidden rounded-md">
        {produto.image ? (
          <img
            src={getOptimizedImageUrl(produto.image, 250)}
            alt={produto.name}
            className="object-cover w-full h-full rounded-md"
            loading="lazy"
            width={125}
            height={100}
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 rounded-md">
            <span className="text-4xl">🍕</span>
          </div>
        )}
      </div>
    </div>
  );
};