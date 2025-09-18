import React from "react";
import { Wallet, CheckCircle } from "lucide-react";
import { useCashback } from "@/hooks/useCashback";

interface CashbackInputProps {
  companyId: string;
  customerPhone?: string;
  totalPedido: number;
  onCashbackApplied: (valor: number) => void;
  disabled?: boolean;
  onSaldoUpdate?: () => void;
}

export const CashbackInput: React.FC<CashbackInputProps> = ({
  companyId,
  customerPhone,
  totalPedido,
  onCashbackApplied,
  disabled = false,
  onSaldoUpdate
}) => {
  const {
    saldoDisponivel,
    loading,
    marcarPendente,
    removerCashback,
    aplicado,
    valorAplicado,
    pendente,
    valorPendente,
    fetchSaldo
  } = useCashback(companyId, customerPhone, totalPedido)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL';
    }).format(value)
  };

  const handleUsarTodoSaldo = () => {
    const valorAUsar = Math.min(saldoDisponivel, totalPedido)
    if (valorAUsar <= 0) return;

    marcarPendente(valorAUsar)
    onCashbackApplied(valorAUsar)
  };

  const handleRemoverCashback = () => {
    removerCashback()
    onCashbackApplied(0)
  };

  if (saldoDisponivel <= 0) {
    return null;


  return (
    <div className="space-y-3">
      {!aplicado && !pendente ? (
        /* Opção compacta para usar cashback */
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Cashback - Você tem {formatCurrency(saldoDisponivel)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="usar-cashback"
                onChange={(e) => {
                  if (e.target.checked) {
                    handleUsarTodoSaldo()
                  }
                }}
                disabled={disabled || loading || saldoDisponivel <= 0}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <label htmlFor="usar-cashback" className="text-sm text-green-700 cursor-pointer">
                Quero usar meu cashback
              </label>
            </div>
          </div>
        </div>
      ) : pendente ? (
        /* Cashback pendente - será aplicado quando o pedido for confirmado */
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Cashback será aplicado: -{formatCurrency(valorPendente)}
              </span>
            </div>
            <button
              onClick={handleRemoverCashback}
              disabled={disabled}
              className="text-xs text-yellow-700 hover:text-yellow-800 underline hover:no-underline transition-all px-2 py-1"
            >
              Remover
            </button>
          </div>
          <div className="text-xs text-yellow-600 mt-1 ml-6">
            O desconto será aplicado após a confirmação do pedido
          </div>
        </div>
      ) : (
        /* Cashback aplicado - versão compacta */
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Cashback aplicado: -{formatCurrency(valorAplicado)}
              </span>
            </div>
            <button
              onClick={handleRemoverCashback}
              disabled={disabled}
              className="text-xs text-green-700 hover:text-green-800 underline hover:no-underline transition-all px-2 py-1"
            >
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  )
};
