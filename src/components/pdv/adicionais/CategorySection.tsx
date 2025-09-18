import React from 'react';
import { SizeOptionCard } from './SizeOptionCard';
import { IngredientCard } from './IngredientCard';

interface CategorySectionProps {
  categoria: any;
  selectedAdicionais: { [key: string]: number };
  onAdicionalChange: (adicionalId: string, categoria: any, quantidade: number) => void;
  isSize?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categoria,
  selectedAdicionais,
  onAdicionalChange,
  isSize = false
}) => {
  const handleAdicionalClick = (adicional: any) => {
    if (categoria.selection_type === 'single') {
      onAdicionalChange(adicional.id, categoria, selectedAdicionais[adicional.id] ? 0 : 1)
    } else if (categoria.selection_type === 'multiple') {
      onAdicionalChange(adicional.id, categoria, selectedAdicionais[adicional.id] ? 0 : 1)
    } else {
      const currentQty = selectedAdicionais[adicional.id] || 0;
      onAdicionalChange(adicional.id, categoria, currentQty + 1)
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-bold text-gray-800">{categoria.name.toUpperCase()}</h3>
        {categoria.is_required && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Obrigatório
          </span>
        )}
      </div>
      
      <div className={`grid gap-2 ${
        isSize 
          ? 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8' 
          : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      }`}>
        {categoria.adicionais.map((adicional: any) => (
          isSize ? (
            <SizeOptionCard
              key={adicional.id}
              adicional={adicional}
              isSelected={selectedAdicionais[adicional.id] > 0}
              onClick={() => handleAdicionalClick(adicional)}
            />
          ) : (
            <IngredientCard
              key={adicional.id}
              adicional={adicional}
              categoria={categoria}
              selectedQuantity={selectedAdicionais[adicional.id] || 0}
              onClick={() => handleAdicionalClick(adicional)}
              onQuantityChange={onAdicionalChange}
            />
          )
        ))}
      </div>
    </div>
  )
};
