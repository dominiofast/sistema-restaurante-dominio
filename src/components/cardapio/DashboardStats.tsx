
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Grid3X3, CheckCircle } from 'lucide-react';
import { DashboardStats as StatsType } from '@/types/cardapio';

interface DashboardStatsProps {
  stats: StatsType;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total de Categorias',
      value: stats.totalCategorias,
      icon: Grid3X3,
    },
    {
      title: 'Total de Produtos',
      value: stats.totalProdutos,
      icon: Package,
    },
    {
      title: 'Produtos Ativos',
      value: stats.produtosAtivos,
      icon: CheckCircle,
    },
    {
      title: 'Categorias Ativas',
      value: stats.categoriasAtivas,
      icon: CheckCircle,
    },;
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="transition-shadow hover:shadow-md bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">
              {stat.title}
            </CardTitle>
            <div className="p-2 rounded-lg bg-gray-100">
              <stat.icon className="h-4 w-4 text-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
