
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
    label: 'Em análise', 
    color: 'bg-orange-500', 
    lightColor: 'bg-orange-50',
    textColor: 'text-white', 
    textColorDark: 'text-orange-700',
    border: 'border-orange-500',
    icon: ClipboardList,
    gradient: 'from-orange-400 to-orange-600',
    enabled: true
  },
  { 
    key: 'producao', 
    label: 'Em produção', 
    color: 'bg-blue-500', 
    lightColor: 'bg-blue-50',
    textColor: 'text-white', 
    textColorDark: 'text-blue-700',
    border: 'border-blue-500',
    icon: Package,
    gradient: 'from-blue-400 to-blue-600',
    enabled: true
  },
  { 
    key: 'pronto', 
    label: 'Prontos para entrega', 
    color: 'bg-green-600', 
    lightColor: 'bg-green-50',
    textColor: 'text-white', 
    textColorDark: 'text-green-700',
    border: 'border-green-600',
    icon: CheckCircle,
    gradient: 'from-green-500 to-green-700',
    enabled: true
  },
  { 
    key: 'entregue', 
    label: 'Entregue', 
    color: 'bg-slate-300', 
    lightColor: 'bg-slate-50',
    textColor: 'text-gray-700', 
    textColorDark: 'text-slate-700',
    border: 'border-slate-400',
    icon: Truck,
    gradient: 'from-slate-200 to-slate-400',
    enabled: true
  },
  { 
    key: 'cancelado', 
    label: 'Cancelados', 
    color: 'bg-red-500', 
    lightColor: 'bg-red-50',
    textColor: 'text-white', 
    textColorDark: 'text-red-700',
    border: 'border-red-500',
    icon: X,
    gradient: 'from-red-400 to-red-600',
    enabled: false  // Desabilitado por padrão
  }
];

export const TIPO_PEDIDO = [
  { key: 'todos', label: 'Todos', icon: ClipboardList },
  { key: 'delivery', label: 'Delivery', icon: Truck },
  { key: 'balcao', label: 'Balcão', icon: ShoppingCart },
  { key: 'ficha', label: 'Atendimento', icon: User },
  { key: 'cancelados', label: 'Cancelados', icon: X },
];
