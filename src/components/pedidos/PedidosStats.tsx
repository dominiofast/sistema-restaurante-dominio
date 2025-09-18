
import React from 'react';
import { ShoppingCart, Clock, CheckCircle, Truck } from 'lucide-react';

interface PedidosStatsProps {
  pedidosPorStatus: Record<string, any[]>;
}

export const PedidosStats: React.FC<PedidosStatsProps> = ({ pedidosPorStatus }) => {
  const stats = [
    {
      title: 'Em Análise',
      count: pedidosPorStatus.analise?.length || 0,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Em Produção',
      count: pedidosPorStatus.producao?.length || 0,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Prontos',
      count: pedidosPorStatus.pronto?.length || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Entregues',
      count: pedidosPorStatus.entregue?.length || 0,
      icon: Truck,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    };
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className={`${stat.bg} rounded-lg p-4 border border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              </div>
              <Icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
