import React from 'react';

interface Categoria {
  id: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
}

interface CategoryNavigationProps {
  categorias: Categoria[];
  categoriaSelecionada: string | null;
  onCategoriaSelect: (categoriaId: string | null) => void;
  primaryColor: string;
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categorias,
  categoriaSelecionada,
  onCategoriaSelect,
  primaryColor
}) => {
  if (categorias.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="bg-white py-3 px-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 categoria-nav-scroll">
          <button
            onClick={() => onCategoriaSelect(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              categoriaSelecionada === null 
                ? 'text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            style={categoriaSelecionada === null ? { backgroundColor: primaryColor } : {}}
          >
            🔥 Em Destaque
          </button>
          {categorias.map(categoria => (
            <button
              key={categoria.id}
              onClick={() => onCategoriaSelect(categoria.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                categoriaSelecionada === categoria.id 
                  ? 'text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={categoriaSelecionada === categoria.id ? { backgroundColor: primaryColor } : {}}
            >
              {categoria.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
