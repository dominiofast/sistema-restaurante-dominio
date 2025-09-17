import React from 'react';

interface PDVFooterActionsProps {
  onVoltar: () => void;
  onPagamentoEntrega: () => void;
  disabledPagamento?: boolean;
  operador?: string;
}

export const PDVFooterActions: React.FC<PDVFooterActionsProps> = ({
  onVoltar,
  onPagamentoEntrega,
  disabledPagamento = false,
  operador
}) => {
  return (
    <footer className="fixed bottom-0 left-0 w-full flex items-center justify-between px-8 py-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)] border-t z-50">
      <div className="flex flex-col text-xs text-gray-500">
        <span>Operador: <b>{operador || '---'}</b></span>
      </div>
      <div className="flex gap-4 w-full max-w-xl mx-auto">
        <button
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg text-lg shadow transition-colors"
          onClick={onVoltar}
        >
          VOLTAR
        </button>
        <button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg shadow transition-colors disabled:opacity-60"
          onClick={onPagamentoEntrega}
          disabled={disabledPagamento}
        >
          PAGAMENTO E ENTREGA
        </button>
      </div>
      <div className="w-32" /> {/* Espaço para alinhamento */}
    </footer>
  );
};
