
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePagamentoEntregaConfigPDV } from '@/hooks/usePagamentoEntregaConfigPDV';
import { Loader2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  companyId?: string;
  selectedPayment: string;
  onPaymentChange: (value: string) => void;
  selectedCardBrand?: string;
  onCardBrandChange?: (value: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  companyId,
  selectedPayment,
  onPaymentChange,
  selectedCardBrand,
  onCardBrandChange
}) => {
  const { paymentOptions, askCardBrand, loading } = usePagamentoEntregaConfigPDV(companyId)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="ml-2 text-sm text-gray-600">Carregando formas de pagamento...</span>
      </div>
    )
  }

  if (paymentOptions.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2">
        Nenhuma forma de pagamento configurada
      </div>
    )
  }

  const getCardBrands = () => {
    const cartaoOption = paymentOptions.find(option => option.value === 'cartao')
    return cartaoOption?.brands || [];
  };

  const shouldShowCardBrands = selectedPayment === 'cartao' && askCardBrand && getCardBrands().length > 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Forma de pagamento
        </label>
        <Select value={selectedPayment} onValueChange={onPaymentChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {paymentOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {shouldShowCardBrands && onCardBrandChange && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Bandeira do cartão
          </label>
          <Select value={selectedCardBrand || ''} onValueChange={onCardBrandChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a bandeira" />
            </SelectTrigger>
            <SelectContent>
              {getCardBrands().map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
};
