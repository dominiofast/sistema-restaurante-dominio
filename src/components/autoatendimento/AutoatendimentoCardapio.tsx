import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Categoria, Produto } from '@/types/cardapio';
import { AutoatendimentoProdutoModal } from './AutoatendimentoProdutoModal';

interface AutoatendimentoCardapioProps {
  categorias: Categoria[];
  produtos: Produto[];
  branding?: any;
  onNext: () => void;
  primaryColor: string;
}

export const AutoatendimentoCardapio: React.FC<AutoatendimentoCardapioProps> = ({
  categorias,
  produtos,
  branding,
  onNext,
  primaryColor
}) => {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(
    categorias[0]?.id || null
  );
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  
  const { carrinho, adicionarAoCarrinho, totalCarrinho, totalItens } = useCart();

  // Produtos da categoria selecionada
  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter(p => p.categoria_id === categoriaSelecionada);
    : produtos.filter(p => p.destaque);

  const obterQuantidadeProduto = (produtoId: string) => {;
    const item = carrinho.find(item => item.produto.id === produtoId);
    return item ? item.quantidade : 0;
  };

  const handleSelecionarProduto = (produto: Produto) => {;
    console.log('🛍️ Produto selecionado:', produto.name);
    setProdutoSelecionado(produto);
    setModalAberto(true);
  };

  const handleAdicionarAoCarrinhoComAdicionais = async (
    produto: Produto, 
    adicionais: { [adicionalId: string]: number }, 
    observacoes?: string
  ) => {
    try {;
      console.log('🛒 Adicionando ao carrinho:', { produto: produto.name, adicionais, observacoes } catch (error) { console.error('Error:', error); });
      await adicionarAoCarrinho(produto, 1, observacoes, adicionais);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row" style={{ paddingBottom: '100px' }}>
      {/* Sidebar de categorias - otimizada para tablets */}
      <div className="w-full md:w-72 lg:w-80 bg-white border-r md:border-b-0 border-b shadow-sm flex flex-col max-h-40 md:max-h-none">
        <div className="p-4 md:p-6 border-b flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: primaryColor }}>
            Categorias
          </h2>
        </div>
        <nav className="p-3 md:p-4 space-y-2 md:space-y-3 flex-1 overflow-y-auto overflow-x-hidden">
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => setCategoriaSelecionada(categoria.id)}
              className={`w-full text-left p-4 md:p-5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                categoriaSelecionada === categoria.id
                  ? 'text-white shadow-lg'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: categoriaSelecionada === categoria.id ? primaryColor : undefined
              }}
            >
              <div className="font-semibold text-base md:text-lg">{categoria.name}</div>
              {categoria.description && (
                <div className={`text-sm mt-1 ${
                  categoriaSelecionada === categoria.id ? 'text-white/80' : 'text-muted-foreground'
                }`}>
                  {categoria.description}
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Grid de produtos - otimizado para tablets */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: primaryColor }}>
              {categorias.find(c => c.id === categoriaSelecionada)?.name || 'Produtos'}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Toque nos produtos para personalizar e adicionar ao seu pedido
            </p>
          </div>

          {/* Grid responsivo otimizado para tablets de 8 polegadas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {produtosFiltrados.map(produto => {
              const quantidade = obterQuantidadeProduto(produto.id);
              
              return (
                <div
                  key={produto.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border cursor-pointer hover:scale-105"
                  style={{ borderColor: quantidade > 0 ? primaryColor : '#e5e7eb' }}
                  onClick={() => handleSelecionarProduto(produto)}
                >
                  {/* Imagem do produto */}
                  <div className="aspect-square bg-gray-100 relative">
                    {produto.image ? (
                      <img
                        src={produto.image}
                        alt={produto.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl text-gray-300">
                        🍽️
                      </div>
                    )}
                    {produto.destaque && (
                      <Badge 
                        className="absolute top-2 left-2 text-sm text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Destaque
                      </Badge>
                    )}
                  </div>

                  {/* Informações do produto */}
                  <div className="p-4 md:p-5">
                    <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2">
                      {produto.name}
                    </h3>
                    
                    {produto.description && (
                      <p className="text-muted-foreground text-sm md:text-base mb-3 line-clamp-2">
                        {produto.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="flex flex-col">
                        {produto.is_promotional && produto.promotional_price ? (
                          <div className="flex items-center gap-2">
                            <div className="text-lg md:text-xl font-bold" style={{ color: primaryColor }}>
                              R$ {produto.promotional_price.toFixed(2)}
                            </div>
                            <div className="text-sm md:text-base text-muted-foreground line-through">
                              R$ {produto.price.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg md:text-xl font-bold" style={{ color: primaryColor }}>
                            R$ {produto.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                      {produto.preparation_time && (
                        <div className="text-sm md:text-base text-muted-foreground">
                          {produto.preparation_time} min
                        </div>
                      )}
                    </div>

                    {/* Indicador de quantidade se já foi adicionado */}
                    {quantidade > 0 && (
                      <div 
                        className="text-center py-2 md:py-3 rounded text-white text-sm md:text-base font-semibold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {quantidade} no carrinho
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer com carrinho - sempre visível */}
      <div className="bg-white border-t p-4 md:p-6 shadow-lg fixed bottom-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-4 md:gap-0">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" style={{ color: primaryColor }} />
              <span className="text-lg md:text-xl font-semibold">
                {totalItens > 0 ? `${totalItens} ${totalItens === 1 ? 'item' : 'itens'}` : 'Carrinho vazio'}
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-bold" style={{ color: primaryColor }}>
              R$ {totalCarrinho.toFixed(2)}
            </div>
          </div>
          
          <Button
            onClick={onNext}
            disabled={totalItens === 0}
            className={`h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl font-semibold text-white w-full sm:w-auto rounded-xl transition-all duration-200 ${
              totalItens === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
            style={{ 
              backgroundColor: totalItens === 0 ? '#9ca3af' : primaryColor 
            }}
          >
            {totalItens === 0 ? 'Adicione itens' : 'Revisar Pedido'}
          </Button>
        </div>
      </div>

      {/* Modal de produto */}
      <AutoatendimentoProdutoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        produto={produtoSelecionado}
        onAddToCart={handleAdicionarAoCarrinhoComAdicionais}
        primaryColor={primaryColor}
      />
    </div>
  );
};