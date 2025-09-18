import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';

interface CartAdicionais {
  [adicionalId: string]: {
    name: string;
    price: number;
    quantity: number;
  };
}

interface Produto {
  id: string;
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  is_promotional?: boolean;
  image?: string;
}

interface CartItem {
  id: string;
  produto: Produto;
  quantidade: number;
  adicionais?: CartAdicionais;
  preco_unitario: number;
  preco_total: number;
  observacoes?: string;
}

interface CartModalProps {
  carrinho: CartItem[];
  totalCarrinho: number;
  totalItens: number;
  onClose: () => void;
  onRemover: (itemId: string) => void;
  onAtualizarQuantidade: (itemId: string, quantidade: number) => void;
  onFinalizarPedido: () => void;
  onAdicionarAoCarrinho: (produto: Produto) => void;
  primaryColor: string;
}

export const CartModal: React.FC<CartModalProps> = ({
  carrinho,
  totalCarrinho,
  totalItens,
  onClose,
  onRemover,
  onAtualizarQuantidade,
  onFinalizarPedido,
  onAdicionarAoCarrinho,
  primaryColor
}) => {
  const { currentCompany } = useAuth();
  
  // Carrinho atualizado
  useEffect(() => {
    // Log de debug removido
  }, [carrinho]);
  
  const limparCarrinho = () => {
    carrinho.forEach(item => onRemover(item.id));
  };

  // Buscar bebidas reais do cardápio
  const { data: sugestaoProdutos = [] } = useQuery({
    queryKey: ['produtos-bebidas', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data: categorias } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'categorias')
        /* .select\( REMOVIDO */ ; //'id, name')
        /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
        .ilike('name', '%bebida%');
      
      if (!categorias?.length) return [];
      
      const categoriaIds = categorias.map(cat => cat.id);
      
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'produtos')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
        /* .eq\( REMOVIDO */ ; //'is_available', true)
        .in('categoria_id', categoriaIds)
        /* .limit\( REMOVIDO */ ; //6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompany?.id
  });

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-slide-in-right">
        
        {/* Header Fullscreen */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-10 h-10 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                aria-label="Voltar para o cardápio"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Carrinho</h1>
            </div>
            {carrinho.length > 0 && (
              <button
                onClick={limparCarrinho}
                className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                aria-label="Limpar carrinho"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo Scrollável Fullscreen */}
        <div className="flex-1 overflow-y-auto p-4">
          {carrinho.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="text-8xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
              <p className="text-gray-500 text-lg mb-6">Adicione produtos deliciosos ao seu pedido</p>
              <Button
                onClick={onClose}
                className="h-12 px-8 text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                Continuar Comprando
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              
              {/* Itens do Carrinho */}
              {carrinho.map((item) => {
                console.log('🛒 Item do carrinho:', item); // Debug
                console.log('🛒 Observações do item:', item.observacoes); // Debug
                return (
                <div key={item.id} className="bg-white rounded-lg border border-gray-100 mb-3">
                  {/* Layout principal do item */}
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Imagem menor */}
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.produto.image ? (
                          <img
                            src={item.produto.image}
                            alt={item.produto.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-sm">🍕</span>
                        )}
                      </div>
                      
                      {/* Info do produto com mais espaço */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-3">
                            <h3 className="font-medium text-gray-900 text-sm leading-tight">
                              {item.produto.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-base font-bold" style={{ color: primaryColor }}>
                                R$ {item.preco_total.toFixed(2)}
                              </span>
                              {item.produto.is_promotional && item.produto.promotional_price && (
                                <span className="text-gray-500 line-through text-xs">
                                  R$ {(item.produto.price * item.quantidade).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Controles + Remover */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Controles de quantidade */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onAtualizarQuantidade(item.id, item.quantidade - 1)}
                                className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-colors"
                                disabled={item.quantidade <= 1}
                                aria-label={`Diminuir quantidade de ${item.produto.name}`}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm font-medium min-w-[16px] text-center">
                                {item.quantidade}
                              </span>
                              <button
                                onClick={() => onAtualizarQuantidade(item.id, item.quantidade + 1)}
                                className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-colors"
                                aria-label={`Aumentar quantidade de ${item.produto.name}`}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            
                            {/* Botão Remover */}
                            <button
                              onClick={() => onRemover(item.id)}
                              className="w-7 h-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors ml-1"
                              aria-label={`Remover ${item.produto.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Observações do item */}
                        {item.observacoes && item.observacoes.trim() && (
                          <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-300 mb-2">
                            <div className="text-xs text-gray-600">
                              <div className="font-semibold text-yellow-700 mb-1">Observações:</div>
                              <p className="text-gray-700 text-xs leading-relaxed">{item.observacoes}</p>
                            </div>
                          </div>
                        )}

                        {/* Adicionais por categoria - mostrar todos, inclusive preço 0 */}
                        {item.adicionais && (
                          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-300">
                            <div className="text-xs text-gray-600">
                              <div className="font-semibold text-blue-700 mb-2">Adicionais:</div>
                              <div className="space-y-2">
                                {/* Agrupar por categoria (prioriza categoryName do carrinho; fallback para prefixo no nome) */}
                                {(() => {
                                  const adicionaisList = Object.values(item.adicionais || {});
                                  const groups: Record<string, { name: string; quantity: number; price: number }[]> = {};
                                  adicionaisList.forEach((a) => {
                                    const raw = a.name || '';
                                    const catFromData = (a as any).categoryName || '';
                                    let category = catFromData;
                                    let name = raw;
                                    if (!category) {
                                      const parts = raw.split(/\s*[-:]\s*/);
                                      if (parts.length > 1) {
                                        category = parts[0];
                                        name = parts.slice(1).join(' - ');
                                      } else {
                                        category = 'Outros';
                                      }
                                    }
                                    if (!groups[category]) groups[category] = [];
                                    groups[category].push({ name, quantity: a.quantity, price: a.price });
                                  });
                                  const categories = Object.keys(groups);
                                  return categories.map((cat) => (
                                    <div key={cat}>
                                      <div className="text-blue-700 font-semibold mb-1">{cat}</div>
                                      <div className="space-y-1">
                                        {groups[cat]
                                          .filter(g => g.quantity > 0)
                                          .map((g, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                              <div className="flex items-center gap-1">
                                                <span className="text-blue-600">+ </span>
                                                <span className="text-gray-700">
                                                  {g.quantity}x {g.name}
                                                </span>
                                              </div>
                                              <span className="text-gray-600 font-medium">
                                                {g.price > 0 ? `+R$ ${(g.price * g.quantity).toFixed(2)}` : 'R$ 0,00'}
                                              </span>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}

              {/* Resumo do pedido */}
              <div className="mt-2 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Resumo do pedido</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">R$ {totalCarrinho.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Taxa de entrega</span>
                    <span>Calculada no próximo passo</span>
                  </div>
                </div>
              </div>

              {/* Seção "Peça também" - Uma linha com scroll */}
              {sugestaoProdutos.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">Peça também</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {sugestaoProdutos.map((produto) => (
                      <div key={produto.id} className="bg-white border border-gray-200 rounded-lg p-2 min-w-[90px] flex-shrink-0">
                        <div className="w-full h-12 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          {produto.image ? (
                            <img
                              src={produto.image}
                              alt={produto.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <span className="text-sm">🥤</span>
                          )}
                        </div>
                        <h4 className="text-xs font-medium text-gray-900 mb-1 leading-tight line-clamp-2 h-6">
                          {produto.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-bold" style={{ color: primaryColor }}>
                            R$ {(produto.is_promotional ? produto.promotional_price || produto.price : produto.price).toFixed(2)}
                          </span>
                          <button
                            onClick={() => onAdicionarAoCarrinho(produto)}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: primaryColor }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé Fixo com Botões Fullscreen - Melhor Visibilidade */}
        {carrinho.length > 0 && (
          <div className="sticky bottom-0 border-t border-gray-200 p-4 bg-white shadow-lg">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-14 text-lg font-semibold border-2 hover:bg-gray-50"
                style={{ 
                  borderColor: primaryColor, 
                  color: primaryColor,
                  backgroundColor: 'white'
                }}
                onClick={onClose}
              >
                Adicionar mais produtos
              </Button>
              <Button
                className="w-full h-14 text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: primaryColor }}
                onClick={onFinalizarPedido}
                aria-label={`Avançar para pagamento. Total R$ ${totalCarrinho.toFixed(2)}`}
              >
                Avançar • R$ {totalCarrinho.toFixed(2)}
              </Button>
            </div>
          </div>
        )}
    </div>
  );
};