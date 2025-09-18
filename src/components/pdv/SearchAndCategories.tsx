
import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchAndCategoriesProps {
  busca: string;
  setBusca: (value: string) => void;
  categorias: any[];
  categoriaSelecionada: string | null;
  setCategoriaSelecionada: (id: string) => void;
}

export const SearchAndCategories: React.FC<SearchAndCategoriesProps> = ({
  busca,
  setBusca,
  categorias,
  categoriaSelecionada,
  setCategoriaSelecionada
}) => {
  console.log('🔍 SearchAndCategories: Renderizando com categorias:', categorias.length, categorias)
  console.log('🔍 SearchAndCategories: Categoria selecionada:', categoriaSelecionada)

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Header compacto */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">Ponto de Venda</h1>
          <div className="text-sm text-gray-500">
            Selecione produtos e gerencie pedidos
          </div>
        </div>
        
        {/* Barra de busca compacta */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar produtos por nome, código ou descrição..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Seção de categorias compacta */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-end mb-1">
          <div className="flex items-center text-xs text-gray-500">
            <Filter className="h-3 w-3 mr-1" />
            {categorias.length}
          </div>
        </div>
        
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {categorias.length === 0 ? (
            <div className="flex items-center justify-center w-full py-4 text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-200">
              <div className="text-center">
                <Filter className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                <p className="text-xs font-medium">Nenhuma categoria encontrada</p>
              </div>
            </div>
          ) : (
            categorias.map(cat => (
              <button
                key={cat.id}
                className={`flex-shrink-0 px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-all duration-200 border min-w-fit ${
                  categoriaSelecionada === cat.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                }`}
                onClick={() => setCategoriaSelecionada(cat.id)}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
};
