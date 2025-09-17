
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  searchTerm: string;
  categoriaSelecionada: string | null;
  onClearSearch: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  categoriaSelecionada,
  onClearSearch
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">
        {searchTerm ? '🔍' : categoriaSelecionada === null ? '⭐' : '📦'}
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
      </h3>
      <p className="opacity-70 mb-4">
        {searchTerm 
          ? `Não encontramos produtos com "${searchTerm}". Tente uma busca diferente.`
          : categoriaSelecionada === null 
            ? 'Nenhum produto está marcado como destaque no momento.'
            : 'Esta categoria ainda não possui produtos disponíveis.'
        }
      </p>
      {searchTerm && (
        <Button 
          variant="outline" 
          onClick={onClearSearch}
          className="mt-2"
        >
          Limpar busca
        </Button>
      )}
    </div>
  );
};
