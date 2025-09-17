
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const DashboardStats = () => {
  const { currentCompany, getCompanyData } = useAuth();
  const companyData = getCompanyData();

  if (!currentCompany || !companyData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Receita Total",
      value: companyData.totalRevenue,
      icon: DollarSign,
      change: "+20.1% em relação ao mês passado",
      changeType: "positive"
    },
    {
      title: "Pedidos",
      value: companyData.totalOrders.toString(),
      icon: ShoppingCart,
      change: "+15.3% em relação ao mês passado",
      changeType: "positive"
    },
    {
      title: "Usuários Ativos",
      value: companyData.activeUsers.toString(),
      icon: Users,
      change: "+8.1% em relação ao mês passado",
      changeType: "positive"
    },
    {
      title: "Taxa de Conversão",
      value: companyData.conversionRate,
      icon: TrendingUp,
      change: "+2.5% em relação ao mês passado",
      changeType: "positive"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stat.value}</div>
            <p className="text-xs text-green-600 mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
