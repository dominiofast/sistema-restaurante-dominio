import React from 'react';
import { ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';

const PedidosPage = () => {
  const pedidos = [
    { id: 1, cliente: 'João Silva', total: 45.90, status: 'pendente', tempo: '15 min', items: 3 },
    { id: 2, cliente: 'Maria Santos', total: 32.50, status: 'preparando', tempo: '8 min', items: 2 },
    { id: 3, cliente: 'Pedro Costa', total: 78.20, status: 'pronto', tempo: '2 min', items: 5 },
    { id: 4, cliente: 'Ana Oliveira', total: 29.90, status: 'entregue', tempo: 'Concluído', items: 2 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparando': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pronto': return 'bg-green-100 text-green-800 border-green-200';
      case 'entregue': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="h-4 w-4" />;
      case 'preparando': return <ShoppingCart className="h-4 w-4" />;
      case 'pronto': return <CheckCircle className="h-4 w-4" />;
      case 'entregue': return <CheckCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestão de Pedidos</h1>
          <p className="text-gray-600">Acompanhe e gerencie todos os pedidos em tempo real</p>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Pedidos Hoje</h3>
              <p className="text-3xl font-bold text-blue-600">127</p>
              <p className="text-sm text-blue-600">+12% vs ontem</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Faturamento</h3>
              <p className="text-3xl font-bold text-green-600">R$ 4.250</p>
              <p className="text-sm text-green-600">+8% vs ontem</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Pendentes</h3>
              <p className="text-3xl font-bold text-yellow-600">7</p>
              <p className="text-sm text-yellow-600">Aguardando preparo</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">Tempo Médio</h3>
              <p className="text-3xl font-bold text-purple-600">22min</p>
              <p className="text-sm text-purple-600">Preparo + entrega</p>
            </div>
          </div>
        </div>

        {/* Pedidos List */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pedidos Recentes</h2>
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">#{pedido.id}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{pedido.cliente}</h3>
                      <p className="text-sm text-gray-600">{pedido.items} itens • R$ {pedido.total.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{pedido.tempo}</p>
                      <p className="text-xs text-gray-500">Tempo restante</p>
                    </div>
                    
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${getStatusColor(pedido.status)}`}>
                      {getStatusIcon(pedido.status)}
                      <span className="text-sm font-medium capitalize">{pedido.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidosPage;