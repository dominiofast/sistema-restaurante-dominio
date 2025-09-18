
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Printer, X } from 'lucide-react';

interface PedidoConfirmacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId?: string | number;
  total: number;
  onImprimirVenda?: () => void;
  onNovaVenda?: () => void;
}

export const PedidoConfirmacaoModal: React.FC<PedidoConfirmacaoModalProps> = ({
  isOpen,
  onClose,
  pedidoId,
  total,
  onImprimirVenda,
  onNovaVenda
}) => {
  if (!isOpen) return null;

  const handleFechar = () => {
    onClose()
  };

  const handleConfirmar = () => {
    if (onNovaVenda) {
      onNovaVenda()
    }
    onClose()
  };

  const handleImprimir = () => {
    if (onImprimirVenda) {
      onImprimirVenda()
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4">
        {/* Header com ícone de sucesso */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Venda Registrada!
          </h2>
          <p className="text-gray-600 text-sm">
            Confirme para realizar as seguintes operações:
          </p>
        </div>

        {/* Informações do pedido */}
        {pedidoId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Pedido:</span>
              <span className="text-sm font-bold text-gray-900">#{pedidoId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span className="text-lg font-bold text-green-600">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Opções de ação */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-sm text-gray-700 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Imprimir Venda
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">
              Salvar escolha e não perguntar novamente
            </span>
          </label>
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleFechar}
            className="w-full"
          >
            FECHAR [ESC]
          </Button>
          <Button
            onClick={handleConfirmar}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            CONFIRMAR [ENTER]
          </Button>
        </div>
      </div>
    </div>
  )
};
