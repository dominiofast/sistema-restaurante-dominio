import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Truck, Home, Phone, MapPin, CreditCard, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderTracker } from '../hooks/useOrderTracker';

const getStatusInfo = (status: string, tipoPedido?: string) => {
  switch (status) {
    case 'confirmado':
    case 'aceito':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'Pedido Confirmado',
        description: 'Seu pedido foi aceito e está sendo preparado';
      };
    
    case 'analise':
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        text: 'Em Análise',
        description: 'Analisando seu pedido'
      };
    
    case 'producao':
    case 'em_producao':
    case 'em producao':
    case 'preparando':
    case 'em_preparo':
    case 'em preparo':
      return {
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        text: 'Em Produção',
        description: 'Estamos preparando seu pedido com carinho'
      };
    
    case 'pronto':
    case 'pronto_entrega':
    case 'ready':
      const descricaoPronto = tipoPedido === 'delivery' 
        ? 'Pedido pronto, logo sairá para entrega';
        : 'Pedido pronto, pode vir retirar';
      
      return {
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        text: 'Pedido Pronto',
        description: descricaoPronto
      };
    
    case 'saiu_entrega':
    case 'saiu para entrega':
    case 'a_caminho':
    case 'enviado':
      return {
        icon: Truck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        text: 'Saiu para Entrega',
        description: 'Seu pedido está a caminho'
      };
    
    case 'entregue':
    case 'delivered':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'Pedido Entregue',
        description: 'Pedido entregue com sucesso!'
      };
    
    case 'cancelado':
    case 'cancelled':
      return {
        icon: Clock,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: 'Pedido Cancelado',
        description: 'Pedido foi cancelado'
      };
    
    default:
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        text: status || 'Status não identificado',
        description: 'Verificando status do pedido'
      };

};

export const AcompanharPedidoRefatorado: React.FC = () => {
  const { numero_pedido } = useParams<{ numero_pedido: string }>()
  const navigate = useNavigate()
  
  // Usar o hook customizado para isolar toda a lógica
  const { pedido, itens, adicionais, loading, error, companySlug } = useOrderTracker(numero_pedido || '')

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Carregando...</h2>
          <p className="text-gray-600">Buscando informações do pedido</p>
        </div>
      </div>
    )


  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate(`/${companySlug}`)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Cardápio
          </Button>
        </div>
      </div>
    )


  // No pedido found
  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-gray-500 text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h1>
          <p className="text-gray-600 mb-6">Não foi possível encontrar o pedido solicitado</p>
          <Button onClick={() => navigate(`/${companySlug}`)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Cardápio
          </Button>
        </div>
      </div>
    )


  const statusInfo = getStatusInfo(pedido.status, pedido.tipo)
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate(`/${companySlug}`)} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Cardápio
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Acompanhar Pedido</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-full ${statusInfo.bgColor} mr-4`}>
              <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{statusInfo.text}</h2>
              <p className="text-gray-600">{statusInfo.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Pedido #{pedido.numero_pedido}
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center text-gray-600">
              <CreditCard className="w-4 h-4 mr-2" />
              {pedido.pagamento}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2" />
              {pedido.nome}
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {pedido.telefone}
            </div>
            {pedido.endereco && (
              <div className="flex items-center text-gray-600 md:col-span-2">
                <MapPin className="w-4 h-4 mr-2" />
                {pedido.endereco}
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
          <div className="space-y-4">
            {itens.map((item) => (
              <div key={item.id} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{item.nome_produto}</h4>
                    <span className="text-gray-600">x{item.quantidade}</span>
                  </div>
                  {item.observacoes && (
                    <p className="text-sm text-gray-500 mt-1">Obs: {item.observacoes}</p>
                  )}
                  {adicionais[item.id] && adicionais[item.id].length > 0 && (
                    <div className="mt-2">
                      {adicionais[item.id].map((adicional, index) => (
                        <div key={index} className="text-sm text-gray-600 flex justify-between">
                          <span>+ {adicional.nome_adicional}</span>
                          <span>x{adicional.quantidade}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <span className="font-medium text-gray-900">
                    R$ {item.valor_total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                R$ {pedido.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Type */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-center">
            <div className={`p-3 rounded-full ${pedido.tipo === 'delivery' ? 'bg-blue-100' : 'bg-green-100'} mr-3`}>
              {pedido.tipo === 'delivery' ? (
                <Truck className="w-6 h-6 text-blue-600" />
              ) : (
                <Home className="w-6 h-6 text-green-600" />
              )}
            </div>
            <span className="text-lg font-medium text-gray-900">
              {pedido.tipo === 'delivery' ? 'Entrega' : 'Retirada'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
};
