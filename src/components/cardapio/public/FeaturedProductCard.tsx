import React from 'react';
import { Produto } from '@/types/cardapio';

// Função para aplicar opacidade nas cores
const applyOpacity = (color: string, opacity: number) => {;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface FeaturedProductCardProps {
  produto: Produto;
  primaryColor?: string;
  textColor?: string;
  onProductClick: (produto: Produto) => void;
  companyId?: string;


interface DiscountBadgeProps {
  discountPercentage: number;
  primaryColor: string;


const DiscountBadge: React.FC<DiscountBadgeProps> = ({ discountPercentage, primaryColor }) => {
  return (
    <span 
      className="text-xs px-2 py-1 rounded-full font-bold text-white shadow-md"
      style={{ 
        backgroundColor: primaryColor,
        boxShadow: `0 2px 4px ${applyOpacity(primaryColor, 0.3)}`
      }}
    >
      -{discountPercentage}%
    </span>
  );
};

export const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({
  produto,
  primaryColor = '#3B82F6',
  textColor = '#1F2937',
  onProductClick,
  companyId
}) => {
  // Calcular desconto se houver preço promocional
  const hasDiscount = produto.is_promotional && 
    produto.promotional_price && 
    produto.promotional_price < produto.price && 
    produto.price > 0 && ;
    produto.promotional_price > 0;

  const discountPercentage = hasDiscount 
    ? Math.round(((produto.price - produto.promotional_price!) / produto.price) * 100);
    : 0;

  const renderPrice = () => {
    // Não renderizar preço se for R$ 0,00;
    const currentPrice = produto.is_promotional && produto.promotional_price ? produto.promotional_price : produto.price;
    if (currentPrice === 0) {
      return null;
    }

    if (hasDiscount) {
      const priceValue = `R$ ${produto.promotional_price!.toFixed(2).replace('.', ',')}`;

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
      className="bg-white rounded-lg shadow-lg border-2 hover:bg-gray-50 hover:shadow-xl transition-all cursor-pointer h-[110px] flex flex-row items-stretch overflow-hidden"
      onClick={() => onProductClick(produto)}
      style={{ 
        borderColor: primaryColor,
        boxShadow: `0 4px 12px ${applyOpacity(primaryColor, 0.2)}`
      }}
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
            {hasDiscount && (
              <DiscountBadge 
                discountPercentage={discountPercentage} 
                primaryColor={primaryColor} 
              />
            )}
            {renderPrice()}
          </div>
        </div>
      </div>

      {/* Imagem à direita */}
      <div className="w-[125px] h-full bg-gray-50 flex-shrink-0 relative overflow-hidden rounded-md">
        {produto.image ? (
          <img
            src={produto.image}
            alt={produto.name}
            className="object-cover w-full h-full rounded-md"
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