import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Search, X, ArrowLeft, Share2 } from 'lucide-react';
import { Produto } from '@/types/cardapio';
import { useProductAdicionais } from '@/hooks/useProductAdicionais';

interface UnifiedProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: Produto;
  onAdvance: (produto: Produto, adicionais: { [adicionalId: string]: number }, observacoes?: string) => void;
  primaryColor?: string;
  companyId?: string;
}

const UnifiedProductModal: React.FC<UnifiedProductModalProps> = ({
  isOpen,
  onClose,
  produto,
  onAdvance,
  primaryColor = '#dc2626',
  companyId
}) => {
  const [selectedAdicionais, setSelectedAdicionais] = useState<{ [adicionalId: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{ [categoriaId: string]: boolean }>({});
  
  
  const { categorias, loading, error } = useProductAdicionais(produto?.id);

  // Inicializar categorias expandidas quando carregarem
  useEffect(() => {
    if (categorias.length > 0) {
      const initialExpanded: { [categoriaId: string]: boolean } = {};
      categorias.forEach(categoria => {
        initialExpanded[categoria.id] = true;
      });
      setExpandedCategories(initialExpanded);
    }
  }, [categorias]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAdicionais({});
      setSearchTerm('');
      
    }
  }, [isOpen]);

  // Facebook Pixel: ViewContent ao abrir o modal do produto
  useEffect(() => {
    if (isOpen && produto && typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', 'ViewContent', {
          content_ids: [produto.id],
          content_name: produto.name,
          content_type: 'product',
          value: Number((produto as any).promotional_price || (produto as any).price) || 0,
          currency: 'BRL',
        });
      } catch (e) {
        console.warn('[FacebookPixel] ViewContent error', e);
      }
    }
  }, [isOpen, produto?.id]);

  const toggleCategory = (categoriaId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoriaId]: !prev[categoriaId]
    }));
  };

  const getTotalSelectedInCategory = (categoriaId: string) => {
    const categoria = categorias.find(cat => cat.id === categoriaId);
    if (!categoria) return 0;
    
    return categoria.adicionais.reduce((total: number, adicional: any) => {
      return total + (selectedAdicionais[adicional.id] || 0);
    }, 0);
  };

  const addAdicional = (adicionalId: string, categoria: any) => {
    const currentQuantity = selectedAdicionais[adicionalId] || 0;
    const totalSelectedInCategory = getTotalSelectedInCategory(categoria.id);
    
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
      
      // Auto-scroll para próxima categoria se for seleção única
      setTimeout(() => scrollToNextCategory(categoria.id), 300);
    } else {
      // Para multiple e quantity, usar a mesma lógica
      const newQuantity = currentQuantity + 1;
      
      // Verificar limite apenas se existe max_selection
      if (categoria.max_selection && totalSelectedInCategory >= categoria.max_selection) {
        return; // Não permitir ultrapassar o limite
      }
      
      const newSelection = {
        ...selectedAdicionais,
        [adicionalId]: newQuantity
      };
      
      setSelectedAdicionais(newSelection);
      
      // Verificar se atingiu o limite máximo após atualizar
      const newTotalInCategory = getTotalSelectedInCategoryWithNewSelection(categoria.id, newSelection);
      if (categoria.max_selection && newTotalInCategory >= categoria.max_selection) {
        // Auto-scroll para próxima categoria quando atingir o limite
        setTimeout(() => scrollToNextCategory(categoria.id), 300);
      }
    }
  };

  // Função auxiliar para calcular total com nova seleção
  const getTotalSelectedInCategoryWithNewSelection = (categoriaId: string, newSelection: { [adicionalId: string]: number }) => {
    const categoria = categorias.find(cat => cat.id === categoriaId);
    if (!categoria) return 0;
    
    return categoria.adicionais.reduce((total: number, adicional: any) => {
      return total + (newSelection[adicional.id] || 0);
    }, 0);
  };

  // Função para rolar para a próxima categoria
  const scrollToNextCategory = (currentCategoriaId: string) => {
    const currentIndex = categorias.findIndex(cat => cat.id === currentCategoriaId);
    if (currentIndex === -1 || currentIndex === categorias.length - 1) {
      // Se é a última categoria, rolar para o botão de avançar
      const advanceButton = document.getElementById('advance-button');
      if (advanceButton) {
        advanceButton.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }
      return;
    }
    
    const nextCategoria = categorias[currentIndex + 1];
    if (nextCategoria) {
      const nextCategoryElement = document.getElementById(`category-${nextCategoria.id}`);
      if (nextCategoryElement) {
        // Expandir a próxima categoria se não estiver expandida
        setExpandedCategories(prev => ({
          ...prev,
          [nextCategoria.id]: true
        }));
        
        // Rolar para a próxima categoria
        setTimeout(() => {
          nextCategoryElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }, 150);
      }
    }
  };

  const removeAdicional = (adicionalId: string) => {
    const currentQuantity = selectedAdicionais[adicionalId] || 0;
    if (currentQuantity > 0) {
      if (currentQuantity === 1) {
        const newSelection = { ...selectedAdicionais };
        delete newSelection[adicionalId];
        setSelectedAdicionais(newSelection);
      } else {
        setSelectedAdicionais(prev => ({
          ...prev,
          [adicionalId]: currentQuantity - 1
        }));
      }
    }
  };

  const calculateTotal = () => {
    let total = produto.promotional_price || produto.price;
    
    categorias.forEach(categoria => {
      categoria.adicionais.forEach((adicional: any) => {
        const quantity = selectedAdicionais[adicional.id] || 0;
        total += adicional.price * quantity;
      });
    });
    
    return total;
  };

  const canAdvance = () => {
    return categorias.every(categoria => {
      if (!categoria.is_required) return true;
      
      const totalSelected = getTotalSelectedInCategory(categoria.id);
      const minSelection = categoria.min_selection || 1;
      
      return totalSelected >= minSelection;
    });
  };

  const handleAdvance = () => {
    if (canAdvance()) {
      onAdvance(produto, selectedAdicionais);
    }
  };

  const getFilteredAdicionais = (categoria: any) => {
    if (!searchTerm) return categoria.adicionais;
    
    return categoria.adicionais.filter((adicional: any) =>
      adicional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (adicional.description && adicional.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  if (!produto || !isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-white"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'white'
      }}
    >
      <div className="w-full max-w-6xl mx-auto bg-white h-full flex flex-col">
        {/* Header fixo */}
        <div className="flex-shrink-0 w-full bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-4">
            {/* Botão voltar */}
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Título do produto - apenas no mobile */}
            <h1 className="text-lg font-semibold text-gray-900 flex-1 px-4 text-center md:hidden">
              {produto.name}
            </h1>
            
            {/* Título para desktop */}
            <h1 className="hidden md:block text-lg font-semibold text-gray-900 flex-1 px-4">
              {produto.name}
            </h1>
            
            {/* Botões de ação */}
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo rolável */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{
            height: 'calc(100vh - 140px)', // Header + Footer
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch',
            maxHeight: 'calc(100vh - 140px)'
          }}
        >
          {/* Layout do produto - responsivo */}
          <div className="md:flex md:gap-8 md:p-8">
            {/* Imagem do produto */}
            <div className="w-full md:w-80 md:flex-shrink-0 flex justify-center md:py-0">
              <div className="w-full aspect-square md:w-80 md:h-80 overflow-hidden rounded-lg relative">
                <img
                  src={produto.image || '/placeholder.svg'}
                  alt={produto.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Informações do produto */}
            <div className="flex-1 px-4 md:px-0">
              <div className="md:mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">
                  {produto.name}
                </h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl md:text-3xl font-bold" style={{ color: primaryColor }}>
                    R$ {(produto.promotional_price || produto.price).toFixed(2).replace('.', ',')}
                  </span>
                  {produto.promotional_price && (
                    <>
                      <span className="text-sm md:text-base text-gray-500 line-through">
                        R$ {produto.price.toFixed(2).replace('.', ',')}
                      </span>
                      {(() => {
                        const discount = Math.round(((produto.price - produto.promotional_price) / produto.price) * 100);
                        return discount > 0 ? (
                          <span 
                            className="text-white text-xs md:text-sm px-2 py-1 rounded"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {discount}%
                          </span>
                        ) : null;
                      })()}
                    </>
                  )}
                </div>

                {/* Descrição - apenas no desktop */}
                {produto.description && (
                  <p className="hidden md:block text-gray-600 mb-4 leading-relaxed pr-16">
                    {produto.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo dos adicionais */}
          <div className="px-4 md:px-8 pb-6">
            {/* Busca */}
            {categorias.length > 0 && (
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pesquise pelo nome"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando opções...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-8">
                <p className="text-red-600">Erro ao carregar opções: {error}</p>
              </div>
            )}

            {/* Layout das seções - agora sem grid em desktop */}
            {!loading && !error && categorias.length > 0 && (
              <div className="space-y-6">
                {categorias.map((categoria) => {
                  const filteredAdicionais = getFilteredAdicionais(categoria);
                  const totalSelected = getTotalSelectedInCategory(categoria.id);
                  const isExpanded = expandedCategories[categoria.id];
                  
                  return (
                    <div key={categoria.id} className="mb-6" id={`category-${categoria.id}`}>
                      <div
                        className="flex items-center justify-between px-2 py-4 bg-gray-50 rounded-t-lg cursor-pointer"
                        onClick={() => toggleCategory(categoria.id)}
                      >
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{categoria.name}</h3>
                          <p className="text-sm text-gray-600">
                            {categoria.selection_type === 'single' ? 'Escolha 1 item' : 
                             categoria.selection_type === 'multiple' ? `Escolha de ${categoria.min_selection || 0} a ${categoria.max_selection || 'ilimitados'} itens` :
                             `Escolha até ${categoria.max_selection || 'ilimitados'} itens`}
                            {totalSelected > 0 && ` (${totalSelected} selecionado${totalSelected > 1 ? 's' : ''})`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {categoria.is_required && (
                            <span 
                              className="text-white text-xs font-bold px-2 py-1 rounded"
                              style={{ backgroundColor: primaryColor }}
                            >
                              Obrigatório
                            </span>
                          )}
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="bg-white">
                          {filteredAdicionais.map((adicional: any) => {
                            const quantity = selectedAdicionais[adicional.id] || 0;
                            const canAdd = categoria.selection_type === 'single' ? 
                              totalSelected === 0 || quantity > 0 :
                              !categoria.max_selection || totalSelected < categoria.max_selection;
                            const canRemove = quantity > 0;
                            
                            return (
                              <div key={adicional.id} className="flex items-center px-2 py-3 border-b border-gray-100 last:border-b-0">
                                {/* Conteúdo do produto */}
                                <div className="flex items-center gap-2 flex-1">
                                  {adicional.image && (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                      <img src={adicional.image} alt={adicional.name} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 pr-2 leading-tight break-words">{adicional.name}</h4>
                                    {adicional.description && (
                                      <p className="text-sm text-gray-600 mb-1" style={{ paddingRight: quantity > 0 ? '30px' : '24px' }}>{adicional.description}</p>
                                    )}
                                    <p className="text-xs font-medium text-green-600">
                                      + R$ {adicional.price.toFixed(2).replace('.', ',')}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Área fixa para controles */}
                                <div className="w-20 flex items-center justify-end">
                                  {categoria.selection_type === 'single' ? (
                                    <input
                                      type="radio"
                                      name={`categoria-${categoria.id}`}
                                      value={adicional.id}
                                      checked={quantity > 0}
                                      onChange={() => addAdicional(adicional.id, categoria)}
                                      className="w-5 h-5"
                                      style={{ accentColor: primaryColor }}
                                    />
                                  ) : quantity > 0 ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => removeAdicional(adicional.id)}
                                        disabled={!canRemove}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                          canRemove 
                                            ? 'text-white hover:opacity-90' 
                                            : 'border-gray-300 text-gray-300 cursor-not-allowed'
                                        }`}
                                        style={{ 
                                          backgroundColor: canRemove ? primaryColor : undefined,
                                          borderColor: canRemove ? primaryColor : undefined
                                        }}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      
                                      <span className="font-semibold text-sm min-w-[1.5rem] text-center">
                                        {quantity}
                                      </span>
                                      
                                      <button
                                        onClick={() => addAdicional(adicional.id, categoria)}
                                        disabled={!canAdd}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                          canAdd 
                                            ? 'text-white hover:opacity-90' 
                                            : 'border-gray-300 text-gray-300 cursor-not-allowed'
                                        }`}
                                        style={{ 
                                          backgroundColor: canAdd ? primaryColor : undefined,
                                          borderColor: canAdd ? primaryColor : undefined
                                        }}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                   ) : (
                                     <button
                                       onClick={() => addAdicional(adicional.id, categoria)}
                                       disabled={!canAdd}
                                       className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                         canAdd
                                           ? 'hover:bg-opacity-10' 
                                           : 'border-gray-300 text-gray-300 cursor-not-allowed'
                                       }`}
                                       style={{ 
                                         borderColor: canAdd ? primaryColor : undefined,
                                         color: canAdd ? primaryColor : undefined
                                       }}
                                     >
                                       <Plus className="w-3 h-3" />
                                     </button>
                                   )}
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
             )}
           </div>
         </div>


        {/* Botão fixo no rodapé */}
        <div className="flex-shrink-0 w-full bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto md:max-w-none">
            <button 
              id="advance-button"
              onClick={handleAdvance}
              className={`w-full py-4 rounded-lg font-semibold flex items-center justify-between px-4 transition-colors ${
                canAdvance() 
                  ? 'text-white hover:opacity-90' 
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              style={{ 
                backgroundColor: canAdvance() ? primaryColor : undefined 
              }}
              disabled={!canAdvance()}
            >
              <span>Avançar</span>
              <span>R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedProductModal;