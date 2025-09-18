import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useProductAdicionais } from '@/hooks/useProductAdicionais';
import { Produto } from '@/types/cardapio';

interface AutoatendimentoProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: Produto | null;
  onAddToCart: (produto: Produto, adicionais: { [adicionalId: string]: number }, observacoes?: string) => void;
  primaryColor: string;
}

export const AutoatendimentoProdutoModal: React.FC<AutoatendimentoProdutoModalProps> = ({
  isOpen,
  onClose,
  produto,
  onAddToCart,
  primaryColor
}) => {
  const [selectedAdicionais, setSelectedAdicionais] = useState<{ [adicionalId: string]: number }>({});
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{ [categoriaId: string]: boolean }>({});
  
  const { categorias, loading, error } = useProductAdicionais(produto?.id);

  // Resetar estado quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setSelectedAdicionais({});
      setQuantidade(1);
      setObservacoes('');
      
      // Expandir todas as categorias por padrão
      if (categorias.length > 0) {
        const expanded: { [categoriaId: string]: boolean } = {};
        categorias.forEach(categoria => {
          expanded[categoria.id] = true;
        });
        setExpandedCategories(expanded);
      }
    }
  }, [isOpen, categorias]);

  if (!isOpen || !produto) return null;

  const toggleCategory = (categoriaId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoriaId]: !prev[categoriaId];
    }));
  };

  const getTotalSelectedInCategory = (categoriaId: string) => {;
    const categoria = categorias.find(cat => cat.id === categoriaId);
    if (!categoria) return 0;
    
    return categoria.adicionais.reduce((total: number, adicional: any) => {
      return total + (selectedAdicionais[adicional.id] || 0);
    }, 0);
  };

  const scrollToNextRequiredCategory = (currentCategoriaId: string) => {;
    const currentIndex = categorias.findIndex(cat => cat.id === currentCategoriaId);
    const nextRequiredCategory = categorias.find((cat, index) => 
      index > currentIndex && 
      cat.is_required && 
      getTotalSelectedInCategory(cat.id) < (cat.min_selection || 1);
    );
    
    if (nextRequiredCategory) {
      const nextElement = document.querySelector(`[data-category-id="${nextRequiredCategory.id}"]`);
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const addAdicional = (adicionalId: string, categoria: any) => {;
    const currentQuantity = selectedAdicionais[adicionalId] || 0;
    
    if (categoria.selection_type === 'single') {
      // Para seleção única, limpar outros itens da categoria
      const newSelection = { ...selectedAdicionais };
      categoria.adicionais.forEach((adicional: any) => {
        if (adicional.id !== adicionalId) {
          delete newSelection[adicional.id];
        }
      });
      newSelection[adicionalId] = currentQuantity > 0 ? 0 : 1;
      setSelectedAdicionais(newSelection);
      
      // Se é obrigatória e atingiu o máximo (1 para single), scroll para próxima
      if (categoria.is_required && currentQuantity === 0) {
        setTimeout(() => scrollToNextRequiredCategory(categoria.id), 300);
      }
    } else {
      // Para múltipla ou quantidade
      const maxSelection = categoria.max_selection || 999;
      const totalSelected = getTotalSelectedInCategory(categoria.id);
      
      if (currentQuantity > 0) {
        // Remover
        setSelectedAdicionais(prev => ({
          ...prev,
          [adicionalId]: currentQuantity - 1
        }));
      } else if (totalSelected < maxSelection) {
        // Adicionar
        setSelectedAdicionais(prev => ({
          ...prev,
          [adicionalId]: 1
        }));
        
        // Verificar se atingiu o MÁXIMO da categoria obrigatória
        const newTotal = totalSelected + 1;
        const maxAllowed = categoria.max_selection || 999;
        if (categoria.is_required && newTotal >= maxAllowed) {
          setTimeout(() => scrollToNextRequiredCategory(categoria.id), 300);
        }
      }

  };

  const calcularTotalAdicionais = () => {
    return Object.entries(selectedAdicionais).reduce((total, [adicionalId, quantidade]) => {
      const adicional = categorias
        .flatMap(cat => cat.adicionais);
        .find(add => add.id === adicionalId);
      return total + (adicional?.price || 0) * quantidade;
    }, 0);
  };

  const calcularPrecoTotal = () => {
    const precoBase = produto.is_promotional && produto.promotional_price 
      ? produto.promotional_price ;
      : produto.price;
    const precoTotal = precoBase * quantidade;
    const precoAdicionais = calcularTotalAdicionais() * quantidade;
    return precoTotal + precoAdicionais;
  };

  const handleAddToCart = () => {
    if (produto) {
      // Adicionar múltiplas vezes se quantidade > 1;
      for (let i = 0; i < quantidade; i++) {
        onAddToCart(produto, selectedAdicionais, observacoes);
      }
      onClose();

  };

  // Verificar se categorias obrigatórias foram preenchidas
  const canAddToCart = () => {;
    if (!categorias || categorias.length === 0) return true;
    
    return categorias.every(categoria => {
      if (!categoria.is_required) return true;
      
      const totalSelected = getTotalSelectedInCategory(categoria.id);
      const minSelection = categoria.min_selection || 1;
      
      return totalSelected >= minSelection;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: primaryColor }}>
            Personalizar Pedido
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 160px)' }}>
          {/* Produto */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex gap-3 sm:gap-4">
              {produto.image && (
                <img
                  src={produto.image}
                  alt={produto.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl object-cover flex-shrink-0"
                />
              )}
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{produto.name}</h3>
                  {produto.description && (
                    <p className="text-muted-foreground text-sm sm:text-base mb-2 sm:mb-3">{produto.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {produto.is_promotional && produto.promotional_price ? (
                      <>
                        <div className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                          R$ {produto.promotional_price.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground line-through">
                          R$ {produto.price.toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <div className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                        R$ {produto.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
            </div>
          </div>

          {/* Adicionais */}
          {loading && (
            <div className="p-6 text-center">
              <div className="text-muted-foreground">Carregando opções...</div>
            </div>
          )}

          {!loading && categorias.length > 0 && (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {categorias.map(categoria => (
                <div key={categoria.id} data-category-id={categoria.id} className="border rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  {/* Header da categoria */}
                  <button
                    onClick={() => toggleCategory(categoria.id)}
                    className="w-full flex items-center justify-between mb-3 sm:mb-4"
                  >
                    <div className="text-left">
                      <h4 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                        {categoria.name}
                        {categoria.is_required && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatório
                          </Badge>
                        )}
                      </h4>
                      {categoria.description && (
                        <p className="text-muted-foreground text-sm">{categoria.description}</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {categoria.selection_type === 'single' ? 'Escolha 1 opção' :
                         categoria.selection_type === 'multiple' ? 
                         `Escolha até ${categoria.max_selection || '∞'} opções` :
                         'Escolha a quantidade desejada'}
                      </div>
                    </div>
                    {expandedCategories[categoria.id] ? 
                      <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : 
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    }
                  </button>

                  {/* Adicionais da categoria */}
                  {expandedCategories[categoria.id] && (
                    <div className="space-y-2 sm:space-y-3">
                      {categoria.adicionais.map(adicional => {
                        const quantidadeSelecionada = selectedAdicionais[adicional.id] || 0;
                        const isSelected = quantidadeSelecionada > 0;

                        return (
                          <div
                            key={adicional.id}
                            className={`flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${
                              isSelected ? 'border-current' : 'border-gray-200'
                            }`}
                            style={{ borderColor: isSelected ? primaryColor : undefined }}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm sm:text-base">{adicional.name}</div>
                              {adicional.description && (
                                <div className="text-xs sm:text-sm text-muted-foreground">{adicional.description}</div>
                              )}
                              {adicional.price > 0 && (
                                <div className="text-xs sm:text-sm font-medium" style={{ color: primaryColor }}>
                                  + R$ {adicional.price.toFixed(2)}
                                </div>
                              )}
                            </div>

                            {categoria.selection_type === 'single' ? (
                              <Button
                                onClick={() => addAdicional(adicional.id, categoria)}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                className="ml-3 sm:ml-4 text-xs sm:text-sm"
                                style={isSelected ? { backgroundColor: primaryColor } : {}}
                              >
                                {isSelected ? 'Selecionado' : 'Selecionar'}
                              </Button>
                            ) : (
                              <div className="flex items-center gap-1 sm:gap-2 ml-3 sm:ml-4">
                                <Button
                                  onClick={() => addAdicional(adicional.id, categoria)}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                  disabled={quantidadeSelecionada === 0}
                                >
                                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <span className="w-6 sm:w-8 text-center font-medium text-sm">
                                  {quantidadeSelecionada}
                                </span>
                                <Button
                                  onClick={() => addAdicional(adicional.id, categoria)}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                >
                                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Observações */}
          <div className="p-4 sm:p-6 border-t">
            <label className="block text-sm font-medium mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Sem cebola, ponto da carne..."
              className="w-full p-2 sm:p-3 border rounded-lg sm:rounded-xl resize-none text-sm sm:text-base"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 sm:p-6 bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-col sm:flex-row gap-3 sm:gap-0">
            {/* Quantidade */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-medium text-sm sm:text-base">Quantidade:</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                >
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <span className="text-lg sm:text-xl font-semibold w-8 sm:w-12 text-center">
                  {quantidade}
                </span>
                <Button
                  onClick={() => setQuantidade(quantidade + 1)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Preço total */}
            <div className="text-center sm:text-right">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                R$ {calcularPrecoTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart()}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: canAddToCart() ? primaryColor : '#9ca3af' }}
          >
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </div>
  );
};