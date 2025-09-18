import React, { useState } from 'react';
import { ArrowLeft, CreditCard, DollarSign, Smartphone, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
// SUPABASE REMOVIDO
import { AsaasPixModal } from './AsaasPixModal';
import { CashbackInput } from '@/components/cashback/CashbackInput';

interface PaymentModalProps {
  onClose: () => void;
  onVoltarEndereco: () => void;
  onConfirm: (paymentMethod: string) => void;
  primaryColor: string;
  totalCarrinho: number;
  companyId: string;
  customerPhone?: string;
  onCashbackUpdate?: () => void;
  taxaEntrega?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  onClose,
  onVoltarEndereco,
  onConfirm,
  primaryColor,
  totalCarrinho,
  companyId,
  customerPhone,
  onCashbackUpdate,
  taxaEntrega = 0
}) => {
  const [selectedPayment, setSelectedPayment] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [needsChange, setNeedsChange] = useState(false)
  const [changeAmount, setChangeAmount] = useState('')
  const [selectedCardBrand, setSelectedCardBrand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalComCashback, setTotalComCashback] = useState(totalCarrinho)
  const [cashbackAplicado, setCashbackAplicado] = useState(0)
  const [showPixModal, setShowPixModal] = useState(false)
  const [observacoes, setObservacoes] = useState('')

  const formatCurrency = (value: number) =>;
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

  // Gerar cores acessíveis baseadas na cor principal
  const accessibleColors = {
    backgroundColor: primaryColor,
    textColor: '#ffffff';
  };

  // Buscar configurações de pagamento da empresa
  const { data: paymentConfig, isLoading, error } = useQuery({
    queryKey: ['payment-config', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error  } = null as any;
      if (error) {
        console.error('❌ Erro ao buscar configuração de pagamento:', error)
        return null;
      }
      
      return data;
    },
    enabled: !!companyId
  })

  // Buscar configuração do Asaas
  const { data: asaasConfig, isLoading: asaasLoading } = useQuery({
    queryKey: ['asaas-config', companyId],
    queryFn: async () => {
      const { data, error  } = null as any;
      console.log('🔍 ASAAS DEBUG - Query result:', { data, error })
      
      if (error) {
        console.error('❌ Erro ao buscar configuração do Asaas:', error)
        return null;
      }

      if (data) {
        console.log('🔍 ASAAS DEBUG - Config encontrada:', {
          is_active: data.is_active,
          pix_enabled: data.pix_enabled,
          has_api_key: !!data.api_key,
          api_key_length: data.api_key?.length
        })
      } else {
        console.log('🔍 ASAAS DEBUG - Nenhuma config encontrada')
      }

      return data;
    },
    enabled: !!companyId,
  })

  // Debug logs APÓS as queries
  console.log('🔍 FINAL DEBUG - Estado atual:', {
    companyId,
    paymentConfigLoading: isLoading,
    asaasConfigLoading: asaasLoading,
    'paymentConfig?.accept_pix': paymentConfig?.accept_pix,
    'asaasConfig available': !!asaasConfig,
    'asaasConfig?.is_active': asaasConfig?.is_active,
    'asaasConfig?.pix_enabled': asaasConfig?.pix_enabled,
    'has_api_key': !!asaasConfig?.api_key,
    'should_show_basic_pix': !!paymentConfig?.accept_pix,
    'should_show_asaas_pix': !!(asaasConfig?.is_active && asaasConfig?.pix_enabled && asaasConfig?.api_key)
  })

  // Buscar bandeiras de cartão se necessário
  const { data: cardBrands } = useQuery({
    queryKey: ['card-brands', paymentConfig?.id],
    queryFn: async () => {
      if (!paymentConfig?.id || !paymentConfig?.ask_card_brand) return [];
      
      const { data, error  } = null as any;
      if (error) {
        console.error('❌ Erro ao buscar bandeiras de cartão:', error)
        return [];
      }
      
      return data || [];
    },
    enabled: !!paymentConfig?.id && !!paymentConfig?.ask_card_brand
  })

  const handlePaymentChange = (paymentType: string) => {
    setSelectedPayment(paymentType)
    if (paymentType === 'dinheiro' || paymentType === 'cartao') {
      setShowModal(true)

  };

  const handleFinalizarPedido = async () => {
    if (!selectedPayment) return;
    
    // Se for PIX Online via Asaas, abrir modal específico
    if (selectedPayment === 'pix_online_asaas') {
      setShowPixModal(true)
      return;

    
    setIsProcessing(true)
    
    try {
      let paymentData;
      
      if (selectedPayment === 'pix') {
        paymentData = {
          method: 'pix',
          needsChange: false,
          changeAmount: 0,
          cardBrand: '',
          cashbackApplied: cashbackAplicado,
          totalWithCashback: totalComCashback
        } catch (error) { console.error('Error:', error) };
      } else if (selectedPayment === 'dinheiro') {
        paymentData = {
          method: 'dinheiro',
          needsChange,
          changeAmount: needsChange ? parseFloat(changeAmount) : 0,
          cardBrand: '',
          cashbackApplied: cashbackAplicado,
          totalWithCashback: totalComCashback
        };
      } else if (selectedPayment === 'cartao') {
        paymentData = {
          method: 'cartao',
          needsChange: false,
          changeAmount: 0,
          cardBrand: selectedCardBrand,
          cashbackApplied: cashbackAplicado,
          totalWithCashback: totalComCashback
        };
      }
      
      // Simular um pequeno delay para mostrar o efeito
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onConfirm(JSON.stringify(paymentData))
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      setIsProcessing(false)

  };

  const handleModalConfirm = () => {
    if (selectedPayment === 'dinheiro') {
      if (needsChange && !changeAmount) {
        alert('Por favor, informe o valor para o troco')
        return;
      }
      // Apenas atualizar o estado local e fechar o modal - não finalizar o pedido
      setShowModal(false)
      resetModalState()
    } else if (selectedPayment === 'cartao') {
      if (paymentConfig?.ask_card_brand && !selectedCardBrand) {
        alert('Por favor, selecione a bandeira do cartão')
        return;
      }
      // Apenas atualizar o estado local e fechar o modal - não finalizar o pedido
      setShowModal(false)
      resetModalState()

  };

  const resetModalState = () => {
    setNeedsChange(false)
    setChangeAmount('')
    setSelectedCardBrand('')
  };

  const closeModal = () => {
    setShowModal(false)
    resetModalState()
  };

  // Sem ícones coloridos para bandeiras, mantendo visual neutro e profissional

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Carregando formas de pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center p-4 sm:p-6">
            <button 
              onClick={onVoltarEndereco}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-3 sm:mr-4 touch-manipulation focus:ring-2 focus:ring-offset-2 focus:outline-none"
              style={{
                '--tw-ring-color': accessibleColors.backgroundColor
              } as React.CSSProperties}
              aria-label="Voltar para endereço"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-white">Finalizar pedido</h1>
          </div>
        </div>
      </div>

      {/* Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto pb-24 overscroll-contain touch-pan-y">
        <div className="max-w-lg mx-auto p-4">
        {/* Header da seção */}
        <div 
          className="rounded-lg p-4 mb-6 border-2"
          style={{ 
            backgroundColor: primaryColor,
            borderColor: primaryColor
          }}
        >
          <h2 className="text-lg font-bold text-white text-center">
            Escolha a forma de pagamento
          </h2>
        </div>

        <div className="space-y-4">
          
          {/* Pagar agora */}
          {(paymentConfig?.accept_pix || (asaasConfig?.is_active && asaasConfig?.pix_enabled && asaasConfig?.api_key)) && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Pagar agora</h3>
                <p className="text-sm text-gray-600">Pague com agilidade e segurança</p>
              </div>
              
              <div className="p-4 space-y-3">
                {/* PIX Básico - só se configurado */}
                {paymentConfig?.accept_pix && (
                  <label 
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{
                      backgroundColor: selectedPayment === 'pix' ? `${primaryColor}08` : 'transparent'
                    }}
                  >
                    <div className="flex items-center flex-1">
                      <input
                        type="radio"
                        name="payment"
                        value="pix"
                        checked={selectedPayment === 'pix'}
                        onChange={(e) => handlePaymentChange(e.target.value)}
                        className="w-4 h-4 mr-3"
                        style={{ accentColor: primaryColor }}
                      />
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#16a34a15', color: '#16a34a' }}
                        >
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">PIX</span>
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ 
                                backgroundColor: '#16a34a15', 
                                color: '#16a34a' 
                              }}
                            >
                              Mais rápido
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Pagamento instantâneo via PIX</p>
                        </div>
                      </div>
                    </div>
                  </label>
                )}

                {/* PIX Online - Via Asaas - só se configurado */}
                {(asaasConfig?.is_active && asaasConfig?.pix_enabled && asaasConfig?.api_key) && (
                  <label 
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{
                      backgroundColor: selectedPayment === 'pix_online_asaas' ? `${primaryColor}08` : 'transparent'
                    }}
                  >
                    <div className="flex items-center flex-1">
                      <input
                        type="radio"
                        name="payment"
                        value="pix_online_asaas"
                        checked={selectedPayment === 'pix_online_asaas'}
                        onChange={(e) => handlePaymentChange(e.target.value)}
                        className="w-4 h-4 mr-3"
                        style={{ accentColor: primaryColor }}
                      />
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#3b82f615', color: '#3b82f6' }}
                        >
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">PIX Online - Via Asaas</span>
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ 
                                backgroundColor: '#3b82f615', 
                                color: '#3b82f6' 
                              }}
                            >
                              Automático
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Aprovação instantânea com QR Code</p>
                        </div>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Pagar na entrega */}
          {(paymentConfig?.accept_cash || paymentConfig?.accept_card) && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Pagar na entrega</h3>
                <p className="text-sm text-gray-600">Realize o pagamento para o entregador</p>
              </div>
              
              <div className="p-4 space-y-3">
                {paymentConfig?.accept_cash && (
                  <label 
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-offset-2"
                    style={{
                      backgroundColor: selectedPayment === 'dinheiro' ? `${primaryColor}08` : 'transparent',
                      '--tw-ring-color': accessibleColors.backgroundColor
                    } as React.CSSProperties}
                  >
                    <div className="flex items-center flex-1">
                      <input
                        type="radio"
                        name="payment"
                        value="dinheiro"
                        checked={selectedPayment === 'dinheiro'}
                        onChange={(e) => handlePaymentChange(e.target.value)}
                        className="w-4 h-4 mr-3 focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          accentColor: accessibleColors.backgroundColor,
                          '--tw-ring-color': accessibleColors.backgroundColor
                        } as React.CSSProperties}
                      />
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                        >
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Dinheiro</span>
                          <p className="text-sm text-gray-600">Pagamento em espécie</p>
                        </div>
                      </div>
                    </div>
                  </label>
                )}

                {paymentConfig?.accept_card && (
                  <label 
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-offset-2"
                    style={{
                      backgroundColor: selectedPayment === 'cartao' ? `${primaryColor}08` : 'transparent',
                      '--tw-ring-color': accessibleColors.backgroundColor
                    } as React.CSSProperties}
                  >
                    <div className="flex items-center flex-1">
                      <input
                        type="radio"
                        name="payment"
                        value="cartao"
                        checked={selectedPayment === 'cartao'}
                        onChange={(e) => handlePaymentChange(e.target.value)}
                        className="w-4 h-4 mr-3 focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          accentColor: accessibleColors.backgroundColor,
                          '--tw-ring-color': accessibleColors.backgroundColor
                        } as React.CSSProperties}
                      />
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                        >
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Cartão</span>
                          <p className="text-sm text-gray-600">Débito ou crédito</p>
                        </div>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Observações */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-gray-900">Observações</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3">
                <textarea
                  placeholder="Alguma observação sobre o pedido?"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  style={{
                    '--tw-ring-color': accessibleColors.backgroundColor
                  } as React.CSSProperties}
                  rows={3}
                  aria-label="Observações sobre o pedido"
                />
              </div>
            </details>
          </div>
        </div>

        {/* Seção de Cashback - Versão Discreta */}
        {customerPhone && (
          <div className="mb-4">
            <CashbackInput
              companyId={companyId}
              customerPhone={customerPhone}
              totalPedido={totalCarrinho}
              onCashbackApplied={(valor) => {
                setCashbackAplicado(valor)
                setTotalComCashback(totalCarrinho - valor)
              }}
              onSaldoUpdate={onCashbackUpdate}
            />
          </div>
        )}

        {/* Resumo do Pagamento */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-gray-700">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(totalCarrinho - taxaEntrega)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-700">
              <span>Taxa de entrega</span>
              <span className="font-medium">{formatCurrency(taxaEntrega)}</span>
            </div>
            {cashbackAplicado > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Cashback aplicado</span>
                <span className="font-semibold">- {formatCurrency(cashbackAplicado)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalComCashback)}
              </span>
            </div>
          </div>
        </div>

        {/* Mensagem se não há formas de pagamento configuradas */}
        {!(paymentConfig?.accept_pix || (asaasConfig?.is_active && asaasConfig?.pix_enabled && asaasConfig?.api_key)) && !paymentConfig?.accept_cash && !paymentConfig?.accept_card && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-800 font-medium text-lg">
              Nenhuma forma de pagamento está configurada para este estabelecimento.
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Botão Finalizar Fixo no Rodapé */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleFinalizarPedido}
            disabled={!selectedPayment || isProcessing}
            className={`w-full font-semibold py-4 rounded-lg transition-all duration-200 ${
              !selectedPayment || isProcessing
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : ''
            }`}
            style={selectedPayment && !isProcessing ? { 
              backgroundColor: accessibleColors.backgroundColor,
              color: accessibleColors.textColor
            } : {}}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                <span>Processando pedido...</span>
              </div>
            ) : (
              selectedPayment ? 'Finalizar Pedido' : 'Selecione a forma de pagamento'
            )}
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg sm:w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 pr-4">
                {selectedPayment === 'dinheiro' ? 'Pagamento em Dinheiro' : 'Bandeira do Cartão'}
              </h2>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 touch-manipulation focus:ring-2 focus:ring-offset-2 focus:outline-none"
                style={{
                  '--tw-ring-color': accessibleColors.backgroundColor
                } as React.CSSProperties}
                aria-label="Fechar modal"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6">
              {selectedPayment === 'dinheiro' ? (
                <div className="space-y-6">
                  <p className="text-gray-700 font-medium text-lg">Você precisa de troco?</p>
                  
                  <div className="space-y-4">
                    <label className="flex items-start cursor-pointer p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-all touch-manipulation focus-within:ring-2 focus-within:ring-offset-2"
                      style={{
                        '--tw-ring-color': accessibleColors.backgroundColor,
                        borderColor: !needsChange ? accessibleColors.backgroundColor : '#e5e7eb'
                      } as React.CSSProperties}>
                      <input
                        type="radio"
                        name="change"
                        checked={!needsChange}
                        onChange={() => setNeedsChange(false)}
                        className="w-5 h-5 mr-4 mt-0.5 flex-shrink-0 touch-manipulation focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        style={{ 
                          accentColor: accessibleColors.backgroundColor,
                          '--tw-ring-color': accessibleColors.backgroundColor
                        } as React.CSSProperties}
                      />
                      <span className="font-medium text-gray-900 text-base">Não, tenho o valor exato</span>
                    </label>
                    
                    <label className="flex items-start cursor-pointer p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-all touch-manipulation focus-within:ring-2 focus-within:ring-offset-2"
                      style={{
                        '--tw-ring-color': accessibleColors.backgroundColor,
                        borderColor: needsChange ? accessibleColors.backgroundColor : '#e5e7eb'
                      } as React.CSSProperties}>
                      <input
                        type="radio"
                        name="change"
                        checked={needsChange}
                        onChange={() => setNeedsChange(true)}
                        className="w-5 h-5 mr-4 mt-0.5 flex-shrink-0 touch-manipulation focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        style={{ 
                          accentColor: accessibleColors.backgroundColor,
                          '--tw-ring-color': accessibleColors.backgroundColor
                        } as React.CSSProperties}
                      />
                      <span className="font-medium text-gray-900 text-base">Sim, preciso de troco</span>
                    </label>
                  </div>

                  {needsChange && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Troco para quanto?
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min={totalComCashback}
                          value={changeAmount}
                          onChange={(e) => setChangeAmount(e.target.value)}
                          placeholder={totalComCashback.toFixed(2)}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors text-lg touch-manipulation"
                          style={{
                            '--tw-ring-color': accessibleColors.backgroundColor
                          } as React.CSSProperties}
                          aria-label="Valor para troco"
                        />
                      </div>
                      {changeAmount && parseFloat(changeAmount) > totalComCashback && (
                        <div className="mt-3 text-sm text-green-600 font-medium">
                          Troco: R$ {(parseFloat(changeAmount) - totalComCashback).toFixed(2)}
                        </div>
                      )}
                      {cashbackAplicado > 0 && (
                        <div className="mt-2 text-sm text-blue-600 font-medium">
                          Total original: R$ {totalCarrinho.toFixed(2)} • Cashback aplicado: R$ {cashbackAplicado.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-gray-700 font-medium text-lg">Selecione a bandeira do cartão:</p>
                  
                  <div className="space-y-3">
                    {cardBrands && cardBrands.length > 0 ? (
                      cardBrands.map((brand: any) => (
                        <label
                          key={brand.id}
                          className="flex items-center cursor-pointer p-4 border rounded-xl transition-all touch-manipulation focus-within:ring-2 focus-within:ring-offset-2"
                          style={{
                            borderColor: selectedCardBrand === brand.brand_name ? accessibleColors.backgroundColor : '#E5E7EB',
                            backgroundColor: selectedCardBrand === brand.brand_name ? `${primaryColor}08` : 'white',
                            boxShadow: selectedCardBrand === brand.brand_name ? '0 4px 14px rgba(0,0,0,0.06)' : 'none',
                            '--tw-ring-color': accessibleColors.backgroundColor
                          } as React.CSSProperties}
                        >
                          <input
                            type="radio"
                            name="cardBrand"
                            value={brand.brand_name}
                            checked={selectedCardBrand === brand.brand_name}
                            onChange={(e) => setSelectedCardBrand(e.target.value)}
                            className="w-5 h-5 mr-4 flex-shrink-0 touch-manipulation focus:ring-2 focus:ring-offset-2 focus:outline-none"
                            style={{ 
                              accentColor: accessibleColors.backgroundColor,
                              '--tw-ring-color': accessibleColors.backgroundColor
                            } as React.CSSProperties}
                          />
                          <div className="flex items-center min-w-0">
                            <span className="font-semibold text-gray-900 text-base">{brand.brand_name}</span>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">Nenhuma bandeira de cartão configurada</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-5 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl sm:rounded-b-2xl">
              <button
                onClick={closeModal}
                className="w-full sm:flex-1 px-6 py-4 rounded-xl font-semibold transition-all text-lg touch-manipulation border"
                style={{ 
                  borderColor: accessibleColors.backgroundColor, 
                  color: accessibleColors.backgroundColor, 
                  backgroundColor: 'white' 
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleModalConfirm}
                className="w-full sm:flex-1 px-6 py-4 rounded-xl font-semibold shadow-sm transition-all duration-200 text-lg touch-manipulation"
                style={{ 
                  backgroundColor: accessibleColors.backgroundColor,
                  color: accessibleColors.textColor
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIX Payment Modal */}
      <AsaasPixModal
        isOpen={showPixModal}
        onClose={() => {
          setShowPixModal(false)
        }}
        onPaymentSuccess={() => {
          setShowPixModal(false)
          // Dados de pagamento PIX aprovado via Asaas
          const paymentData = {
            method: 'pix_online_asaas',
            needsChange: false,
            changeAmount: 0,
            cardBrand: '',
            cashbackApplied: cashbackAplicado,
            totalWithCashback: totalComCashback,
            pixApproved: true;
          };
          onConfirm(JSON.stringify(paymentData))
        }}
        companyId={companyId}
        amount={totalComCashback}
        description={`Pedido - ${formatCurrency(totalCarrinho)}`}
        customerName="Cliente"
        customerPhone={customerPhone}
        externalReference={`order-${Date.now()}`}
        primaryColor={primaryColor}
      />
    </div>
  )
};
