import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ObservacaoModalPDVProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (observacao: string) => void;
  observacaoAtual?: string;
}

export const ObservacaoModalPDV: React.FC<ObservacaoModalPDVProps> = ({
  isOpen,
  onClose,
  onConfirm,
  observacaoAtual = ''
}) => {
  const [observacao, setObservacao] = useState(observacaoAtual)

  useEffect(() => {
    if (isOpen) {
      setObservacao(observacaoAtual)
    }
  }, [isOpen, observacaoAtual])

  const handleConfirm = () => {
    onConfirm(observacao)
    onClose()
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleConfirm()
    } else if (e.key === 'Escape') {
      onClose()
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Observações do Pedido
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações gerais para o pedido:
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite aqui observações importantes para a cozinha ou entrega..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              maxLength={500}
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1">
              {observacao.length}/500 caracteres
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            <p><strong>Dica:</strong> Ctrl + Enter para salvar, Esc para cancelar</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Salvar Observação
          </button>
        </div>
      </div>
    </div>
  )
};
