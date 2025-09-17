import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Smartphone, DollarSign, User, Phone } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { usePagamentoEntregaConfigPDV } from '@/hooks/usePagamentoEntregaConfigPDV';
import { AutoatendimentoPixModal } from './AutoatendimentoPixModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createOrder as createOrderViaGateway } from '@/services/orderGateway';

interface AutoatendimentoCheckoutProps {
  companyId: string;
  onBack: () => void;
  onComplete: (orderData: any) => void;
  primaryColor: string;
}

export const AutoatendimentoCheckout: React.FC<AutoatendimentoCheckoutProps> = ({
  companyId,
  onBack,
  onComplete,
  primaryColor
}) => {
  const { carrinho, totalCarrinho, limparCarrinho } = useCart();
  const { paymentOptions } = usePagamentoEntregaConfigPDV(companyId);
  
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: ''
  });
  
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixPaymentData, setPixPaymentData] = useState<any>(null);

  const total = totalCarrinho;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.phone || !selectedPayment) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Se for PIX, mostrar modal PIX
      if (selectedPayment === 'pix') {
        const pixData = {
          companyId: companyId,
          amount: total,
          description: `Pedido Kiosk - ${customerData.name}`,
          customerName: customerData.name,
          customerPhone: customerData.phone,
          externalReference: `kiosk-${Date.now()}`
        };
        
        setPixPaymentData(pixData);
        setShowPixModal(true);
        setIsProcessing(false);
        return;
      }

      // Para outros métodos de pagamento, criar pedido diretamente
      await createOrder();
      
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      toast.error('Erro ao processar pedido');
      setIsProcessing(false);
    }
  };

  const createOrder = async () => {
    try {
      // 🚀 NOVA SOLUÇÃO: OrderGateway com endpoint seguro
      const pedidoData = {
        companyId: companyId,
        cliente: {
          nome: customerData.name,
          telefone: customerData.phone
        },
        itens: carrinho.map(item => ({
          produto_id: item.produto.id,
          nome: item.produto.name,
          preco: item.produto.is_promotional && item.produto.promotional_price 
            ? item.produto.promotional_price 
            : item.produto.price,
          quantidade: item.quantidade,
          adicionais: item.adicionais ? Object.keys(item.adicionais).map(adicionalId => ({
            id: adicionalId,
            name: item.adicionais![adicionalId].name,
            price: item.adicionais![adicionalId].price,
            quantity: item.adicionais![adicionalId].quantity
          })) : []
        })),
        total: total,
        forma_pagamento: selectedPayment,
        tipo: 'autoatendimento',
        observacoes: `Pedido realizado via Kiosk - ${new Date().toLocaleString()}`
      };

      console.log('📝 Criando pedido via OrderGateway:', pedidoData);

      // 🎯 ENDPOINT SEGURO COM SERVICE ROLE
      const result = await createOrderViaGateway(pedidoData);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar pedido');
      }
      
      console.log('✅ Pedido criado com sucesso via OrderGateway:', result);

      // Limpar carrinho
      limparCarrinho();

      // Chamar callback de sucesso
      onComplete({
        orderId: result.pedido.id,
        customerData,
        total,
        paymentMethod: selectedPayment
      });

    } catch (error) {
      console.error('💥 Erro ao criar pedido:', error);
      throw error;
    }
  };

  const handlePixSuccess = async (pixData: any) => {
    try {
      // 🚀 NOVA SOLUÇÃO: OrderGateway com endpoint seguro
      const pedidoData = {
        companyId: companyId,
        cliente: {
          nome: customerData.name,
          telefone: customerData.phone
        },
        itens: carrinho.map(item => ({
          produto_id: item.produto.id,
          nome: item.produto.name,
          preco: item.produto.is_promotional && item.produto.promotional_price 
            ? item.produto.promotional_price 
            : item.produto.price,
          quantidade: item.quantidade,
          adicionais: item.adicionais ? Object.keys(item.adicionais).map(adicionalId => ({
            id: adicionalId,
            name: item.adicionais![adicionalId].name,
            price: item.adicionais![adicionalId].price,
            quantity: item.adicionais![adicionalId].quantity
          })) : []
        })),
        total: total,
        forma_pagamento: 'pix',
        tipo: 'autoatendimento',
        observacoes: `Pedido PIX via Kiosk - ${new Date().toLocaleString()}`
      };

      // 🎯 ENDPOINT SEGURO COM SERVICE ROLE
      const result = await createOrderViaGateway(pedidoData);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar pedido PIX');
      }
      
      console.log('✅ Pedido PIX criado com sucesso via OrderGateway:', result);

      // Limpar carrinho
      limparCarrinho();

      // Chamar callback de sucesso
      onComplete({
        orderId: result.pedido.id,
        customerData,
        total,
        paymentMethod: 'pix',
        pixData
      });

    } catch (error) {
      console.error('💥 Erro ao criar pedido PIX:', error);
      toast.error('Erro ao processar pagamento PIX');
    }
  };

  const getPaymentIcon = (paymentType: string) => {
    switch (paymentType) {
      case 'pix':
        return <Smartphone className="h-6 w-6" />;
      case 'dinheiro':
        return <DollarSign className="h-6 w-6" />;
      case 'cartao':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mb-4 h-12 md:h-14 text-lg md:text-xl"
          >
            <ArrowLeft className="mr-2 h-6 w-6" />
            Voltar ao Carrinho
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryColor }}>
            Finalizar Pedido
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Complete seus dados e escolha a forma de pagamento
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            {/* Formulário */}
            <div className="xl:col-span-2 space-y-6 md:space-y-8">
              {/* Dados do cliente */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center" style={{ color: primaryColor }}>
                    <User className="mr-2 h-6 w-6" />
                    Seus Dados
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <Label htmlFor="name" className="text-base md:text-lg font-medium">
                        Nome Completo *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        className="h-14 md:h-16 text-base md:text-lg mt-2"
                        placeholder="Digite seu nome"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-base md:text-lg font-medium">
                        Telefone *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        className="h-14 md:h-16 text-base md:text-lg mt-2"
                        placeholder="(00) 00000-0000"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formas de pagamento */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center" style={{ color: primaryColor }}>
                    <CreditCard className="mr-2 h-6 w-6" />
                    Forma de Pagamento
                  </h3>
                  
                  <RadioGroup 
                    value={selectedPayment} 
                    onValueChange={setSelectedPayment}
                    className="space-y-4"
                    disabled={isProcessing}
                  >
                    {paymentOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-4 p-4 md:p-6 rounded-xl border-2 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem 
                          value={option.value} 
                          id={option.value}
                          className="w-6 h-6 md:w-7 md:h-7"
                        />
                        <Label 
                          htmlFor={option.value} 
                          className="flex-1 flex items-center space-x-3 text-base md:text-lg font-medium cursor-pointer"
                        >
                          {getPaymentIcon(option.value)}
                          <span>{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Resumo final */}
            <div>
              <Card className="sticky top-8">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: primaryColor }}>
                    Resumo Final
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {carrinho.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex justify-between text-sm md:text-base">
                        <span className="flex-1">
                          {item.quantidade}x {item.produto.name}
                        </span>
                        <span>R$ {item.preco_total.toFixed(2)}</span>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl md:text-2xl font-bold" style={{ color: primaryColor }}>
                        <span>Total</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 md:h-16 text-lg md:text-xl font-semibold text-white rounded-xl"
                    style={{ backgroundColor: primaryColor }}
                    disabled={!customerData.name || !customerData.phone || !selectedPayment || isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processando...</span>
                      </div>
                    ) : (
                      'Confirmar Pedido'
                    )}
                  </Button>
                  
                  <p className="text-center text-sm md:text-base text-muted-foreground mt-4">
                    Ao confirmar, você aceita os termos de serviço
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Modal PIX */}
        {showPixModal && pixPaymentData && (
          <AutoatendimentoPixModal
            isOpen={showPixModal}
            onClose={() => {
              setShowPixModal(false);
              setIsProcessing(false);
            }}
            onSuccess={handlePixSuccess}
            paymentData={pixPaymentData}
            primaryColor={primaryColor}
          />
        )}
      </div>
    </div>
  );
};