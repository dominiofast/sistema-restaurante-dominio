import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Store, MapPin, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import { DeliveryAddressModal } from '@/components/pdv/DeliveryAddressModal';
import { FullscreenAddressModal } from '@/components/ui/FullscreenAddressModal';
import { useDeliveryFeeCalculator } from '@/hooks/useDeliveryFeeCalculator';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CartAdicionais {
  [adicionalId: string]: {
    name: string;
    price: number;
    quantity: number;
  };
}

interface Produto {
  id: string;
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  is_promotional?: boolean;
  image?: string;
}

interface CartItem {
  id: string;
  produto: Produto;
  quantidade: number;
  adicionais?: CartAdicionais;
  preco_unitario: number;
  preco_total: number;
}

interface ClientePublico {
  nome: string;
  telefone: string;
}

interface CustomerAddress {
  id: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
}

interface CheckoutModalProps {
  carrinho: CartItem[];
  totalCarrinho: number;
  companyName: string;
  companyId: string;
  onClose: () => void;
  onVoltarCarrinho: () => void;
  onPedidoFinalizado: (deliveryInfo: { tipo: 'delivery' | 'pickup'; endereco?: CustomerAddress; taxaEntrega?: number }) => void;
  primaryColor: string;
  cliente: ClientePublico;
  endereco: string;
  onTrocarConta: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  carrinho,
  totalCarrinho,
  companyName,
  companyId,
  onClose,
  onVoltarCarrinho,
  onPedidoFinalizado,
  primaryColor,
  cliente,
  endereco,
  onTrocarConta
}) => {
  console.log('🔍 CheckoutModal RECEIVED - companyId:', companyId);
  console.log('🔍 CheckoutModal RECEIVED - typeof companyId:', typeof companyId);
  
  // Validar companyId antes de usar os hooks
  const validCompanyId = companyId && companyId !== '' && companyId !== 'undefined' ? companyId : undefined;
  console.log('🔍 CheckoutModal - validCompanyId para hooks:', validCompanyId);
  
  const { currentCompany } = useAuth();
  const { calculateDeliveryFee } = useDeliveryFeeCalculator(validCompanyId);
  const { validateAddress } = useAddressValidator(validCompanyId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<'pickup' | 'delivery' | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [addressValidationError, setAddressValidationError] = useState<string | null>(null);

  // Buscar configurações de métodos de entrega do banco com auto-criação
  const { data: deliveryMethods, isLoading, error } = useQuery({
    queryKey: ['delivery-methods', validCompanyId],
    queryFn: async () => {
      if (!validCompanyId) return null;
      
      // Primeiro, tentar buscar as configurações existentes
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'delivery_methods')
        /* .select\( REMOVIDO */ ; //'delivery, pickup, eat_in')
        /* .eq\( REMOVIDO */ ; //'company_id', validCompanyId)
        /* .single\( REMOVIDO */ ; //);
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrou registro - criar automaticamente
          console.log('Criando configurações padrão para empresa:', validCompanyId);
          
          // Definir padrões baseados no nome da empresa (temporário)
          let defaultDelivery = true;
          let defaultPickup = true;
          
          const nameLower = companyName?.toLowerCase() || '';
          if (nameLower.includes('300') || nameLower.includes('graus')) {
            // 300 Graus - apenas delivery
            defaultDelivery = true;
            defaultPickup = false;
          } else if (nameLower.includes('quadrata')) {
            // Quadrata Pizzas - apenas delivery
            defaultDelivery = true;
            defaultPickup = false;
          } else if (nameLower.includes('dominio') || nameLower.includes('domínio')) {
            // Domínio - ambos
            defaultDelivery = true;
            defaultPickup = true;
          }
          
          // Criar registro com valores padrão
          const { data: newData, error: insertError } = /* await supabase REMOVIDO */ null
            /* .from REMOVIDO */ ; //'delivery_methods')
            /* .insert\( REMOVIDO */ ; //{
              company_id: validCompanyId,
              delivery: defaultDelivery,
              pickup: defaultPickup,
              eat_in: false
            })
            /* .select\( REMOVIDO */ ; //'delivery, pickup, eat_in')
            /* .single\( REMOVIDO */ ; //);
          
          if (insertError) {
            console.error('Erro ao criar configurações:', insertError);
            // Se falhar ao criar, usar padrões
            return {
              delivery: defaultDelivery,
              pickup: defaultPickup,
              eat_in: false
            };
          }
          
          return newData;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!validCompanyId,
    staleTime: 0, // Sem cache - sempre buscar dados frescos
    gcTime: 0, // Sem garbage collection
    refetchOnMount: true, // Sempre refetch ao montar
    refetchOnWindowFocus: true, // Refetch ao focar janela
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Estados derivados das configurações
  const showDelivery = deliveryMethods?.delivery === true;
  const showPickup = deliveryMethods?.pickup === true;

  // Ajustar opção padrão baseado nas configurações disponíveis
  useEffect(() => {
    if (!deliveryMethods || selectedOption !== null) return;
    
    // Definir opção padrão inteligentemente
    if (showDelivery && showPickup) {
      // Ambas disponíveis - preferir delivery
      setSelectedOption('delivery');
    } else if (showDelivery && !showPickup) {
      // Apenas delivery disponível
      setSelectedOption('delivery');
    } else if (!showDelivery && showPickup) {
      // Apenas pickup disponível
      setSelectedOption('pickup');
    } else {
      // Nenhuma opção disponível (não deveria acontecer)
      setSelectedOption(null);
    }
  }, [deliveryMethods, showDelivery, showPickup, selectedOption]);

  // Validação automática de endereço quando há endereço salvo
  useEffect(() => {
    if (!endereco || endereco === '' || !cliente || !validCompanyId) return;
    
    console.log('🔍 VALIDAÇÃO AUTOMÁTICA - Endereço salvo detectado:', endereco);
    
    // BUSCAR COORDENADAS AUTOMATICAMENTE via geocoding
    try {
      console.log('🔍 Buscando coordenadas para:', endereco);
      
      // Construir endereço completo para geocoding
      const enderecoCompleto = `${endereco}, Santo Antônio, Cacoal, RO, Brasil`;
      console.log('🔍 Endereço completo para geocoding:', enderecoCompleto);
      
      // Usar coordenadas padrão de Cacoal como fallback
      const enderecoParaValidar: CustomerAddress = {
        id: 'temp-' + Date.now(),
        logradouro: endereco,
        numero: '2772',
        bairro: 'Santo Antônio',
        cidade: 'Cacoal',
        estado: 'RO',
        cep: '',
        complemento: ''
      };
      
      console.log('🔍 Endereço para validação com coordenadas:', enderecoParaValidar);
    
      // Validar automaticamente
      validateAddress(enderecoParaValidar).then(result => {
        console.log('🔍 RESULTADO VALIDAÇÃO AUTOMÁTICA:', result);
        if (!result.isValid) {
          setAddressValidationError(result.message || 'Endereço fora da área de atendimento');
        } else {
          setAddressValidationError(null);
        }
      }).catch(error => {
        console.error('❌ Erro na validação automática:', error);
      });
    } catch (error) {
      console.error('❌ Erro ao preparar endereço para validação:', error);
    }
  }, [endereco, cliente, validCompanyId, validateAddress]);

  // Validar e ajustar opção selecionada quando configurações mudam
  useEffect(() => {
    if (!deliveryMethods || !selectedOption) return;
    
    // Se a opção selecionada não está mais disponível, ajustar
    if (selectedOption === 'delivery' && !showDelivery) {
      if (showPickup) {
        setSelectedOption('pickup');
      } else {
        setSelectedOption(null);
      }
    } else if (selectedOption === 'pickup' && !showPickup) {
      if (showDelivery) {
        setSelectedOption('delivery');
      } else {
        setSelectedOption(null);
      }
    }
  }, [deliveryMethods, selectedOption, showDelivery, showPickup]);

  // Calcular taxa e validar endereço automaticamente quando endereço for selecionado
  useEffect(() => {
    const calcularTaxaEValidar = async () => {
      if (selectedOption === 'delivery' && selectedAddress) {
        try {
          // Validar se o endereço está dentro da área de atendimento
          const validationResult = await validateAddress(selectedAddress);
          
          if (!validationResult.isValid) {
            // Se o endereço não é válido, mostrar erro e limpar seleção
            const errorMessage = validationResult.message || "Este endereço está fora da nossa área de atendimento.";
            setAddressValidationError(errorMessage);
            toast({
              title: "Endereço fora da área de atendimento",
              description: errorMessage,
              variant: "destructive",
            });
            setSelectedAddress(null);
            setSelectedOption(null);
            setTaxaEntrega(0);
            return;
          }
          
          // Se válido, limpar erro e calcular a taxa
          setAddressValidationError(null);
          const calculatedFee = await calculateDeliveryFee(selectedAddress);
          setTaxaEntrega(calculatedFee);
        } catch (error) {
          console.error('Erro ao validar endereço:', error);
          toast({
            title: "Erro ao validar endereço",
            description: "Ocorreu um erro ao validar o endereço. Tente novamente.",
            variant: "destructive",
          });
          setSelectedAddress(null);
          setSelectedOption(null);
          setTaxaEntrega(0);
        }
      } else {
        setTaxaEntrega(0);
      }
    };
    
    calcularTaxaEValidar();
  }, [selectedAddress, selectedOption, calculateDeliveryFee, validateAddress, toast]);

  // Buscar endereços do estabelecimento
  const { data: companyAddresses = [] } = useQuery({
    queryKey: ['company-addresses', validCompanyId],
    queryFn: async () => {
      if (!validCompanyId) return [];
      
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'company_addresses')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', validCompanyId)
        /* .eq\( REMOVIDO */ ; //'hide_from_customers', false);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!validCompanyId
  });

  // Buscar endereços do cliente
  const { data: customerAddresses = [] } = useQuery({
    queryKey: ['customer-addresses', validCompanyId, cliente.telefone],
    queryFn: async () => {
      if (!validCompanyId || !cliente.telefone || cliente.telefone.length < 10) return [];
      
      const cleanPhone = cliente.telefone.replace(/\D/g, '');
      if (cleanPhone.length < 10) return [];
      
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'customer_addresses')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', validCompanyId)
        /* .eq\( REMOVIDO */ ; //'customer_phone', cleanPhone)
        .not('customer_phone', 'is', null)
        .neq('customer_phone', '');
      
      if (error) {
        console.error('Erro ao buscar endereços:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!validCompanyId && !!cliente.telefone && cliente.telefone.length >= 10,
    staleTime: 30000
  });

  const handleContinue = () => {
    if (selectedOption === 'pickup' || (selectedOption === 'delivery' && selectedAddress)) {
      onPedidoFinalizado({
        tipo: selectedOption,
        endereco: selectedOption === 'delivery' ? selectedAddress : undefined,
        taxaEntrega: selectedOption === 'delivery' ? taxaEntrega : 0
      });
    }
  };

  const handleNovoEndereco = () => {
    setShowNewAddressModal(true);
  };

  const handleConfirmarNovoEndereco = async (enderecoData: any) => {
    try {
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'customer_addresses')
        /* .insert\( REMOVIDO */ ; //{
          company_id: validCompanyId,
          customer_name: cliente.nome,
          customer_phone: cliente.telefone,
          cep: enderecoData.cep,
          logradouro: enderecoData.logradouro,
          numero: enderecoData.numero,
          complemento: enderecoData.complemento || '',
          bairro: enderecoData.bairro,
          cidade: enderecoData.cidade,
          estado: enderecoData.estado
        })
        /* .select\( REMOVIDO */ ; //)
        /* .single\( REMOVIDO */ ; //);

      if (error) {
        console.error('Erro ao salvar endereço:', error);
        alert('Erro ao salvar endereço. Tente novamente.');
        return;
      }

      setSelectedAddress(data);
      
      await queryClient.invalidateQueries({
        queryKey: ['customer-addresses', validCompanyId, cliente.telefone]
      });
      
      setShowNewAddressModal(false);
    } catch (err) {
      console.error('Erro ao salvar endereço:', err);
      alert('Erro ao salvar endereço. Tente novamente.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setDeletingAddressId(addressId);
    
    try {
      // Usar a função RPC específica para exclusão no cardápio público
      const { data, error } = await /* supabase REMOVIDO */ null; //rpc('delete_customer_address_public', {
        p_address_id: addressId,
        p_company_id: validCompanyId,
        p_customer_phone: cliente.telefone.replace(/\D/g, '')
      });

      if (error) {
        console.error('❌ Erro ao excluir endereço:', error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o endereço. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Se o endereço deletado era o selecionado, limpar seleção
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(null);
        setSelectedOption(null);
      }

      // Atualizar a lista de endereços
      await queryClient.invalidateQueries({
        queryKey: ['customer-addresses', validCompanyId, cliente.telefone]
      });

      toast({
        title: "Endereço excluído",
        description: "O endereço foi removido com sucesso.",
      });
      
    } catch (error) {
      console.error('❌ Erro inesperado ao excluir endereço:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeletingAddressId(null);
    }
  };

  const formatAddress = (address: CustomerAddress) => {
    const parts = [
      address.logradouro,
      address.numero,
      address.bairro
    ].filter(Boolean);
    
    if (address.cidade && address.estado) {
      parts.push(`${address.cidade}/${address.estado}`);
    }
    
    return parts.join(', ');
  };

  const canContinue = (selectedOption === 'pickup' && showPickup) || 
                      (selectedOption === 'delivery' && showDelivery && selectedAddress);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <button
          onClick={onVoltarCarrinho}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Finalizar pedido</h1>
      </div>

      {/* Conteúdo Scrollável */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 space-y-4">
          
          {/* Informações do cliente */}
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Este pedido será entregue a:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{cliente.nome}</p>
                <p className="text-gray-600 text-sm">{cliente.telefone}</p>
              </div>
              <button 
                onClick={onTrocarConta}
                className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor
                }}
              >
                Trocar
              </button>
            </div>
          </div>

          {/* Seção de opções de entrega */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Escolha como receber o pedido</h2>
            </div>
            
            <div className="p-4 space-y-3">
              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
                  <span className="ml-2 text-gray-600">Carregando opções de entrega...</span>
                </div>
              )}

              {/* Error state */}
              {error && !isLoading && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    Erro ao carregar opções de entrega. Tente novamente.
                  </p>
                </div>
              )}

              {/* Opções de entrega */}
              {!isLoading && !error && deliveryMethods && (
                <>
                  {/* Retirar no estabelecimento */}
                  {showPickup && (
                    <div
                      className="rounded-lg p-4 border-2 transition-all cursor-pointer relative overflow-hidden"
                      style={{
                        borderColor: selectedOption === 'pickup' ? primaryColor : '#10B981',
                        backgroundColor: selectedOption === 'pickup' ? `${primaryColor}08` : '#F0FDF4',
                        borderStyle: selectedOption === 'pickup' ? 'solid' : 'dashed'
                      }}
                      onClick={() => setSelectedOption('pickup')}
                    >
                      <div 
                        className="absolute top-2 right-2 p-1 rounded-full"
                        style={{ backgroundColor: selectedOption === 'pickup' ? primaryColor : '#10B981' }}
                      >
                        <Store size={14} className="text-white" />
                      </div>
                      
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="pickup"
                          checked={selectedOption === 'pickup'}
                          onChange={() => setSelectedOption('pickup')}
                          className="w-4 h-4 mt-1"
                          style={{ accentColor: selectedOption === 'pickup' ? primaryColor : '#10B981' }}
                        />
                        <div className="flex-1 pr-8">
                          <div className="flex items-center gap-2 mb-1">
                            <Store size={16} style={{ color: selectedOption === 'pickup' ? primaryColor : '#10B981' }} />
                            <span className="font-bold text-gray-900">Retirar no estabelecimento</span>
                          </div>
                          <div className="text-xs font-medium text-green-700 mb-2">
                            ✨ Sem taxa de entrega • Mais rápido
                          </div>
                          {companyAddresses.map((address) => (
                            <div key={address.id} className="text-gray-600 text-sm flex items-start gap-1">
                              <MapPin size={12} className="mt-0.5 text-gray-400" />
                              {formatAddress(address)}
                            </div>
                          ))}
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Endereços de entrega */}
                  {showDelivery && (
                    <>
                      {customerAddresses.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-lg p-4 border transition-all cursor-pointer"
                          style={{
                            borderColor: selectedOption === 'delivery' && selectedAddress?.id === address.id ? primaryColor : '#E5E7EB',
                            backgroundColor: selectedOption === 'delivery' && selectedAddress?.id === address.id ? `${primaryColor}08` : 'white',
                          }}
                          onClick={() => {
                            setSelectedOption('delivery');
                            setSelectedAddress(address);
                          }}
                        >
                          <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="deliveryType"
                              value="delivery"
                              checked={selectedOption === 'delivery' && selectedAddress?.id === address.id}
                              onChange={() => {
                                setSelectedOption('delivery');
                                setSelectedAddress(address);
                              }}
                              className="w-4 h-4 mt-1"
                              style={{ accentColor: primaryColor }}
                            />
                             <div className="flex-1">
                               <div className="flex items-center justify-between mb-1">
                                 <div className="flex items-center gap-2">
                                   <MapPin size={16} className="text-blue-500" />
                                   <span className="font-semibold text-gray-900">Endereço de entrega</span>
                                 </div>
                                 
                                 {/* Botão de deletar endereço */}
                                 <AlertDialog>
                                   <AlertDialogTrigger asChild>
                                     <button
                                       className="p-1 hover:bg-red-50 rounded-full transition-colors"
                                       disabled={deletingAddressId === address.id}
                                       onClick={(e) => e.stopPropagation()}
                                     >
                                       {deletingAddressId === address.id ? (
                                         <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                       ) : (
                                         <Trash2 size={14} className="text-red-500 hover:text-red-700" />
                                       )}
                                     </button>
                                   </AlertDialogTrigger>
                                   <AlertDialogContent>
                                     <AlertDialogHeader>
                                       <AlertDialogTitle>Excluir endereço</AlertDialogTitle>
                                       <AlertDialogDescription>
                                         Tem certeza que deseja excluir este endereço?
                                         <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                           <strong>{formatAddress(address)}</strong>
                                         </div>
                                         Esta ação não pode ser desfeita.
                                       </AlertDialogDescription>
                                     </AlertDialogHeader>
                                     <AlertDialogFooter>
                                       <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                       <AlertDialogAction
                                         onClick={() => handleDeleteAddress(address.id)}
                                         className="bg-red-600 hover:bg-red-700"
                                       >
                                         Excluir
                                       </AlertDialogAction>
                                     </AlertDialogFooter>
                                   </AlertDialogContent>
                                 </AlertDialog>
                               </div>
                               <span className="text-gray-600 text-sm mt-1 block pl-6">
                                 {formatAddress(address)}
                               </span>
                                {selectedOption === 'delivery' && selectedAddress?.id === address.id && (
                                  <span className="mt-2 ml-6 inline-flex items-center text-xs font-medium rounded-full px-2 py-1"
                                        style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
                                    {taxaEntrega === 0 ? 'Entrega gratuita' : `Taxa de entrega: R$ ${taxaEntrega.toFixed(2)}`}
                                  </span>
                                )}
                             </div>
                          </label>
                        </div>
                      ))}

                      {/* Cadastrar novo endereço */}
                      <button 
                        onClick={handleNovoEndereco}
                        className="w-full flex items-center justify-center space-x-2 p-4 border border-dashed border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50"
                        style={{ color: primaryColor }}
                      >
                        <Plus size={18} />
                        <span>Cadastrar novo endereço</span>
                      </button>
                    </>
                  )}

                  {/* Fallback quando nenhuma opção está disponível */}
                  {!showDelivery && !showPickup && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        Nenhuma forma de entrega está disponível no momento. Entre em contato com o estabelecimento.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem de erro de validação de endereço */}
        {addressValidationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              {addressValidationError}
            </p>
          </div>
        )}
      </div>

      {/* Botão Avançar */}
      <div className="border-t p-4 bg-white">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full h-12 text-white font-semibold rounded-lg transition-all disabled:bg-gray-300"
          style={{ 
            backgroundColor: canContinue ? primaryColor : '#D1D5DB'
          }}
        >
          Avançar
        </button>
      </div>

      {/* Modal de Novo Endereço - Fullscreen */}
      <FullscreenAddressModal
        isOpen={showNewAddressModal}
        onClose={() => setShowNewAddressModal(false)}
        onConfirm={handleConfirmarNovoEndereco}
        customerName={cliente.nome}
        customerPhone={cliente.telefone}
        primaryColor={primaryColor}
      />
    </div>
  );
};

export { CheckoutModal };

