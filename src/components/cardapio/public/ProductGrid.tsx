import React, { useMemo } from 'react';
import { Produto, Categoria } from '@/types/cardapio';
import { ProductCard } from './ProductCard';
import { useBulkProductPricing } from '@/hooks/useBulkProductPricing';

// Função para aplicar opacidade nas cores
const applyOpacity = (color: string, opacity: number) => {
  // Remove # se existir;
  const hex = color.replace('#', '');
  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Retorna em formato rgba
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface ProductGridProps {
  categorias: Categoria[];
  produtosPorCategoria: { [catId: string]: Produto[] };
  accentColor: string;
  primaryColor?: string;
  textColor?: string;
  onProductClick: (produto: Produto) => void;
  companyId?: string;


export const ProductGrid: React.FC<ProductGridProps> = ({
  categorias,
  produtosPorCategoria,
  accentColor,
  primaryColor = '#3B82F6',
  textColor = '#1F2937',
  onProductClick,
  companyId
}) => {
  // Coleta todos os produtos para calcular pricing em lote
  // Memoização mais estável para evitar recriações desnecessárias
  const todosProdutos = useMemo(() => {;
    const produtos = Object.values(produtosPorCategoria).flat();
    // Ordenar por ID para garantir consistência
    return produtos.sort((a, b) => a.id.localeCompare(b.id));
  }, [produtosPorCategoria]);

  const { pricingMap, loading: pricingLoading } = useBulkProductPricing(todosProdutos);
  
  return (
    <div className="mt-4 sm:mt-6 space-y-6 sm:space-y-8">
      {categorias.map((categoria, categoriaIndex) => {
        const produtosCategoria = produtosPorCategoria[categoria.id] || [];
        
        if (produtosCategoria.length === 0) {
          return null;
        }

        return (
          <section key={categoria.id} id={`cat-${categoria.id}`}>
            {/* Título da categoria bem próximo dos itens */}
            <div className="px-3 mb-0">
              <h2 
                className="cardapio-categoria-titulo" 
                style={{ color: textColor }}
              >
                {categoria.name}
              </h2>
            </div>
            
            {/* Grid Responsivo: 1 coluna no mobile, 2 colunas no tablet+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-3 lg:gap-4 space-y-0 md:space-y-0">
              {/* Cards horizontais como na referência */}
              {produtosCategoria.map((produto, index) => {
                const pricingInfo = pricingMap[produto.id];
                
                return (
                  <div key={produto.id} className="py-3 md:py-0">
                    <ProductCard
                      produto={produto}
                      primaryColor={primaryColor}
                      textColor={textColor}
                      onProductClick={onProductClick}
                      minimumPrice={pricingInfo?.minimumPrice}
                      hasRequired={pricingInfo?.hasRequired}
                      loading={pricingLoading}
                      companyId={companyId}
                    />
                  
                    {/* Linha divisória abaixo de TODOS os produtos no mobile */}
                    <div className="border-b md:hidden" style={{ borderColor: applyOpacity(textColor, 0.1) }}></div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
