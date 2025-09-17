import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, X, ArrowLeft, ChevronRight } from 'lucide-react';
import { AddressSuggestion } from '@/types/address';

interface AddressSuggestionsStepProps {
  suggestions: AddressSuggestion[];
  searchText: string;
  onSuggestionSelect: (suggestion: AddressSuggestion) => void;
  onBack: () => void;
  onClose: () => void;
  primaryColor?: string;
  isFullscreen?: boolean;
}

export const AddressSuggestionsStep: React.FC<AddressSuggestionsStepProps> = ({
  suggestions,
  searchText,
  onSuggestionSelect,
  onBack,
  onClose,
  primaryColor,
  isFullscreen = false
}) => {
  // Layout para fullscreen (sem header próprio)
  if (isFullscreen) {
    return (
      <div className="space-y-6">
        {/* Informação da busca */}
        <div className="text-center">
          <p className="text-gray-600">
            Resultados para: <span className="font-medium text-gray-900">"{searchText}"</span>
          </p>
          <p className="text-sm text-gray-500">
            {suggestions.length} endereço{suggestions.length !== 1 ? 's' : ''} encontrado{suggestions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Lista de sugestões - mais espaçosa */}
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => onSuggestionSelect(suggestion)}
              className="w-full text-left p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200">
                  <MapPin size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg group-hover:text-orange-700">
                    {suggestion.logradouro}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {suggestion.bairro}, {suggestion.cidade} - {suggestion.estado}
                  </div>
                  {suggestion.cep && (
                    <div className="text-sm text-gray-500 mt-1">
                      CEP: {suggestion.cep}
                    </div>
                  )}
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-orange-500" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Layout para modal tradicional
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          Sugestões de Endereço
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="p-6">
        {/* Informação da busca */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Resultados para: <span className="font-medium text-gray-900">"{searchText}"</span>
          </p>
          <p className="text-sm text-gray-500">
            {suggestions.length} endereço{suggestions.length !== 1 ? 's' : ''} encontrado{suggestions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Lista de sugestões */}
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => onSuggestionSelect(suggestion)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
              style={primaryColor ? { 
                borderColor: primaryColor,
                backgroundColor: `${primaryColor}10`
              } : undefined}
            >
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-400 group-hover:text-orange-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-orange-700">
                    {suggestion.logradouro}
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.bairro}, {suggestion.cidade} - {suggestion.estado}
                  </div>
                  {suggestion.cep && (
                    <div className="text-xs text-gray-500 mt-1">
                      CEP: {suggestion.cep}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {/* Opção para não encontrar o endereço */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-400" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Não achei meu endereço
                </div>
                <div className="text-sm text-gray-600">
                  Procurar pelo mapa ou usar localização
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </button>
        </div>

        {/* Botão voltar */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
            style={primaryColor ? { borderColor: primaryColor, color: primaryColor } : undefined}
          >
            Voltar e buscar novamente
          </Button>
        </div>
      </div>
    </>
  );
};
