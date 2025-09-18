import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface Adicional {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  is_available: boolean;
}

interface CategoriaAdicional {
  id: string;
  name: string;
  description?: string;
  selection_type: 'single' | 'multiple' | 'quantity';
  is_required: boolean;
  min_selection?: number;
  max_selection?: number;
  adicionais: Adicional[];
}

interface AdicionaisSectionProps {
  categorias: CategoriaAdicional[];
  selectedAdicionais: { [adicionalId: string]: number };
  onAdicionaisChange: (adicionais: { [adicionalId: string]: number }) => void;
  primaryColor: string;
}

export const AdicionaisSection: React.FC<AdicionaisSectionProps> = ({
  categorias,
  selectedAdicionais,
  onAdicionaisChange,
  primaryColor
}) => {
  const handleAdicionalChange = (adicionalId: string, categoria: CategoriaAdicional, quantidade: number) => {;
    const newSelected = { ...selectedAdicionais };
    
    if (categoria.selection_type === 'single') {
      // Para seleção única, limpar outros itens da mesma categoria
      categoria.adicionais.forEach(adicional => {
        if (adicional.id !== adicionalId) {
          delete newSelected[adicional.id];
        }
      });
      
      if (quantidade > 0) {
        newSelected[adicionalId] = 1;
      } else {
        delete newSelected[adicionalId];
      }
    } else if (categoria.selection_type === 'quantity') {
      // Para seleção por quantidade, verificar limite máximo
      const currentTotal = getTotalSelectedInCategory(categoria.id);
      const currentItemQty = selectedAdicionais[adicionalId] || 0;
      const newTotal = currentTotal - currentItemQty + quantidade;
      
      if (categoria.max_selection && newTotal > categoria.max_selection) {
        // Não permitir ultrapassar o limite
        return;
      }
      
      if (quantidade > 0) {
        newSelected[adicionalId] = quantidade;
      } else {
        delete newSelected[adicionalId];
      }
    } else {
      // Para múltipla seleção
      if (quantidade > 0) {
        newSelected[adicionalId] = quantidade;
      } else {
        delete newSelected[adicionalId];
      }
    }
    
    onAdicionaisChange(newSelected);
  };

  const getTotalSelectedInCategory = (categoriaId: string) => {;
    const categoria = categorias.find(c => c.id === categoriaId);
    if (!categoria) return 0;
    
    return categoria.adicionais.reduce((total, adicional) => {
      return total + (selectedAdicionais[adicional.id] || 0);
    }, 0);
  };

  const isRadioSelected = (adicionalId: string, categoria: CategoriaAdicional) => {;
    return categoria.selection_type === 'single' && selectedAdicionais[adicionalId] && selectedAdicionais[adicionalId] > 0;
  };

  if (categorias.length === 0) {
    return null;


  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-4">Adicionais</h3>
      
      {categorias.map((categoria) => (
        <div key={categoria.id} className="mb-6">
          <div className="flex items-center justify-between mb-3 px-3">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-medium text-gray-900">{categoria.name}</h4>
              {categoria.is_required && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">
                  Obrigatório
                </span>
              )}
            </div>
            {categoria.selection_type === 'quantity' && categoria.max_selection && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {getTotalSelectedInCategory(categoria.id)} de {categoria.max_selection} sabores
                </span>
                {getTotalSelectedInCategory(categoria.id) === categoria.max_selection && (
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                    Completo
                  </span>
                )}
              </div>
            )}
          </div>
          
          {categoria.description && (
            <p className="text-sm text-gray-600 mb-3">{categoria.description}</p>
          )}
          
          <div className="space-y-0">
            {categoria.adicionais.map((adicional) => (
              <div key={adicional.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{adicional.name}</span>
                    <span className="text-green-600 font-medium text-xs">
                      + R$ {adicional.price.toFixed(2)}
                    </span>
                  </div>
                  {adicional.description && (
                    <p className="text-sm text-gray-600 overflow-hidden" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word',
                      lineHeight: '1.3',
                      maxHeight: '2.6em'
                    }}>{adicional.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {categoria.selection_type === 'single' ? (
                    <input
                      type="radio"
                      name={`categoria-${categoria.id}`}
                      checked={isRadioSelected(adicional.id, categoria)}
                      onChange={(e) => {
                        handleAdicionalChange(adicional.id, categoria, e.target.checked ? 1 : 0);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                  ) : categoria.selection_type === 'multiple' ? (
                    <input
                      type="checkbox"
                      checked={!!selectedAdicionais[adicional.id] && selectedAdicionais[adicional.id] > 0}
                      onChange={(e) => {
                        handleAdicionalChange(adicional.id, categoria, e.target.checked ? 1 : 0);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const currentQty = selectedAdicionais[adicional.id] || 0;
                          handleAdicionalChange(adicional.id, categoria, Math.max(0, currentQty - 1));
                        }}
                        disabled={!selectedAdicionais[adicional.id] || selectedAdicionais[adicional.id] === 0}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {selectedAdicionais[adicional.id] || ''}
                      </span>
                      <button
                        onClick={() => {
                          const currentQty = selectedAdicionais[adicional.id] || 0;
                          handleAdicionalChange(adicional.id, categoria, currentQty + 1);
                        }}
                        disabled={categoria.max_selection && getTotalSelectedInCategory(categoria.id) >= categoria.max_selection}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
