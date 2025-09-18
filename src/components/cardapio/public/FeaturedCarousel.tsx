import React from 'react';
import { Produto } from '@/types/cardapio';
import { FeaturedProductCard } from './FeaturedProductCard';

// Função para aplicar opacidade nas cores
const applyOpacity = (color: string, opacity: number) => {;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Função para otimizar URLs de imagem do Supabase
const getOptimizedImageUrl = (url: string | undefined, width: number = 340): string => {;
  if (!url) return '';
  
  // Se for uma URL do Supabase, adicionar transformação de tamanho
  if (url.includes('
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?width=${width}&height=${width}&resize=cover&quality=85`;

  
  return url;
};

interface FeaturedCarouselProps {
  produtosDestaque: Produto[];
  primaryColor: string;
  accentColor: string;
  textColor: string;
  onProductClick: (produto: Produto) => void;
  companyId?: string;


export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  produtosDestaque,
  primaryColor,
  accentColor,
  textColor,
  onProductClick,
  companyId
}) => {
  if (produtosDestaque.length === 0) {
    return null;


  return (
    <section className="mt-4 sm:mt-6">
      <div className="px-3 mb-0">
        <h2 className="cardapio-categoria-titulo" style={{ color: textColor }}>Destaques</h2>
      </div>
      <div className="relative overflow-x-auto cardapio-scroll-hidden">
        <div className="flex gap-3 sm:gap-4 pb-2">
          {produtosDestaque.map((produto) => {
            // Calcular desconto se houver preço promocional
            const hasDiscount = produto.is_promotional && 
              produto.promotional_price && 
              produto.promotional_price < produto.price && 
              produto.price > 0 && ;
              produto.promotional_price > 0;

            const discountPercentage = hasDiscount 
              ? Math.round(((produto.price - produto.promotional_price!) / produto.price) * 100);
              : 0;

            return (
              <div 
                key={produto.id} 
                className="flex-shrink-0 w-[144px] sm:w-[168px] bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => onProductClick(produto)}
              >
                {/* Imagem quadrada no topo - SEM badge, com cantos arredondados */}
                <div className="w-full h-[144px] sm:h-[168px] relative bg-gray-50 rounded-lg overflow-hidden">
                  {produto.image ? (
                    <img
                      src={getOptimizedImageUrl(produto.image, 340)}
                      alt={produto.name}
                      className="object-cover w-full h-full rounded-lg"
                      loading={produtosDestaque.indexOf(produto) < 3 ? "eager" : "lazy"}
                      width={168}
                      height={168}
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 rounded-lg">
                      <span className="text-3xl sm:text-4xl">🍕</span>
                    </div>
                  )}
                </div>
                
                {/* Informações embaixo */}
                <div className="px-2 py-2">
                  {/* Preço promocional na cor da marca - usando font-semibold para maior destaque */}
                  {produto.is_promotional && produto.promotional_price ? (
                    <div className="text-sm font-semibold mb-1" style={{ color: primaryColor }}>
                      R$ {produto.promotional_price.toFixed(2).replace('.', ',')}
                    </div>
                  ) : (
                    <div className="text-sm font-semibold mb-1" style={{ color: primaryColor }}>
                      R$ {produto.price.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                  
                  {/* Badge de desconto e preço original na mesma linha - usando font-bold para máximo impacto */}
                  {hasDiscount && (
                    <div className="flex items-center gap-1 mb-1">
                      <span 
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        -{discountPercentage}%
                      </span>
                      <span className="text-xs line-through text-gray-500 font-normal">
                        R$ {produto.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                  
                  {/* Nome do produto por último - usando font-medium como no ProductCard */}
                  <h3 className="text-xs font-medium line-clamp-2 leading-tight" style={{ color: textColor }}>
                    {produto.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
