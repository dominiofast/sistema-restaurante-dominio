
import { 
  ClipboardList, 
  Package, 
  CheckCircle, 
  Truck, 
  ShoppingCart, 
  User, 
  X 
} from 'lucide-react';

export const STATUS = [
  { 
    key: 'analise', 
    label: 'Aguardando Entrega', 
    description: 'Pedidos recebidos para análise',
    color: 'bg-red-500', 
    lightColor: 'bg-red-50',
    textColor: 'text-white', 
    textColorDark: 'text-red-700',
    border: 'border-red-500',
    icon: ClipboardList,
    gradient: 'from-red-500 to-red-600',
    enabled: true
  },
  { 
    key: 'producao', 
    label: 'Saiu para Entrega', 
    description: 'Em processo de produção',
    color: 'bg-orange-500', 
    lightColor: 'bg-orange-50',
    textColor: 'text-white', 
    textColorDark: 'text-orange-700',
    border: 'border-orange-500',
    icon: Package,
    gradient: 'from-orange-500 to-orange-600',
    enabled: true
  },
  { 
    key: 'pronto', 
    label: 'Entregue', 
    description: 'Prontos para entrega',
    color: 'bg-green-500', 
    lightColor: 'bg-green-50',
    textColor: 'text-white', 
    textColorDark: 'text-green-700',
    border: 'border-green-500',
    icon: CheckCircle,
    gradient: 'from-green-500 to-green-600',
    enabled: true
  },
  { 
    key: 'entregue', 
    label: 'Histórico', 
    description: 'Pedidos entregues',
    color: 'bg-gray-500', 
    lightColor: 'bg-gray-50',
    textColor: 'text-white', 
    textColorDark: 'text-gray-700',
    border: 'border-gray-500',
    icon: Truck,
    gradient: 'from-gray-500 to-gray-600',
    enabled: true
  },
  { 
    key: 'cancelado', 
    label: 'Cancelados', 
    description: 'Pedidos cancelados',
    color: 'bg-red-600', 
    lightColor: 'bg-red-50',
    textColor: 'text-white', 
    textColorDark: 'text-red-700',
    border: 'border-red-600',
    icon: X,
    gradient: 'from-red-600 to-red-700',
    enabled: false  // Desabilitado por padrão
  };
];

export const TIPO_PEDIDO = [
  { key: 'todos', label: 'Todos', icon: ClipboardList },
  { key: 'delivery', label: 'Delivery', icon: Truck },
  { key: 'balcao', label: 'Balcão', icon: ShoppingCart },
  { key: 'ficha', label: 'Atendimento', icon: User },
  { key: 'cancelados', label: 'Cancelados', icon: X },;
];
