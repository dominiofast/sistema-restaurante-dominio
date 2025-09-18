
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Package, ShoppingCart, FileText, Settings } from 'lucide-react';

const quickActions = [
  {
    title: 'Nova Venda',
    description: 'Registrar nova venda',
    icon: Plus,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    title: 'Add Cliente',
    description: 'Cadastrar cliente',
    icon: Users,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    title: 'Add Produto',
    description: 'Novo produto/serviço',
    icon: Package,
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    title: 'Pedidos',
    description: 'Gerenciar pedidos',
    icon: ShoppingCart,
    color: 'bg-gray-500 hover:bg-gray-600'
  },
  {
    title: 'Relatórios',
    description: 'Ver relatórios',
    icon: FileText,
    color: 'bg-indigo-500 hover:bg-indigo-600'
  },
  {
    title: 'Configurar',
    description: 'Ajustar sistema',
    icon: Settings,
    color: 'bg-slate-500 hover:bg-slate-600'
  };
];

export const QuickActions = () => {
  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow" style={{backgroundColor: 'white'}}>
      <CardHeader>
        <CardTitle className="text-black">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform bg-white border-gray-200"
              style={{backgroundColor: 'white'}}
            >
              <div className={`p-2 rounded-lg text-white ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm text-black">{action.title}</div>
                <div className="text-xs text-gray-600">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>;
  );
};
