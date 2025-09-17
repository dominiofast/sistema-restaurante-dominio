
import React from 'react';
import { ShoppingCart, Package, Star } from 'lucide-react';
import { Produto } from '@/types/cardapio';

interface ProductGridProps {
  produtos: Produto[];
  onProductClick: (produto: Produto) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  produtos,
  onProductClick
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-3">
      {produtos.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-base font-medium text-gray-900 mb-1">Nenhum produto encontrado</h3>
            <p className="text-sm text-gray-500">
              Não há produtos disponíveis nesta categoria.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">
              Produtos Disponíveis
            </h3>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {produtos.length} produto{produtos.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-2">
            {produtos.map((produto) => (
              <button
                key={produto.id}
                className="group bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                onClick={() => onProductClick(produto)}
              >
                {/* Área da imagem responsiva */}
                <div className="relative w-full aspect-[4/3] sm:aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {produto.image ? (
                    <img 
                      src={produto.image} 
                      alt={produto.name} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <ShoppingCart size={24} />
                      <span className="text-xs mt-1">Sem imagem</span>
                    </div>
                  )}
                  
                  {/* Badges compactos */}
                  <div className="absolute top-1 left-1 flex flex-col gap-1">
                    {produto.is_promotional && (
                      <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
                        OFERTA
                      </span>
                    )}
                    {produto.destaque && (
                      <span className="bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Star size={8} />
                        TOP
                      </span>
                    )}
                  </div>
                </div>

                {/* Informações do produto responsivas */}
                <div className="p-3 sm:p-2 flex-1 flex flex-col">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-xs leading-tight mb-2 sm:mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {produto.name}
                  </h4>
                  
                  <div className="mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {produto.is_promotional && produto.promotional_price ? (
                          <>
                            <span className="text-sm font-bold text-red-600">
                              R$ {produto.promotional_price.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              R$ {produto.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            R$ {produto.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-blue-600 text-white p-1.5 rounded-full group-hover:bg-blue-700 transition-colors">
                        <ShoppingCart size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
