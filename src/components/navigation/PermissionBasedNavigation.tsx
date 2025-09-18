import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PermissionGuard, SuperAdminOnly, AdminOnly } from '@/components/auth/PermissionGuard';
import { usePermissions } from '@/contexts/PermissionsContext';
import { cn } from '@/lib/utils';
import {
  Users,
  Building,
  ShoppingCart,
  Settings,
  BarChart3,
  Shield,
  Package,
  Calculator,
  BrainCircuit,
  Truck,
  ExternalLink,
  Code
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: 'Vendas & Atendimento',
    items: [
      {
        label: 'Pedidos',
        path: '/pedidos',
        icon: ShoppingCart,
        permission: 'orders.read',
        description: 'Visualizar e gerenciar pedidos'
      },
      {
        label: 'PDV',
        path: '/pdv',
        icon: Calculator,
        permission: 'orders.create',
        description: 'Ponto de venda'
      },
      {
        label: 'Clientes',
        path: '/clientes',
        icon: Users,
        permission: 'users.read',
        description: 'Gerenciar clientes'

    ]
  },
  {
    title: 'Gerenciamento',
    items: [
      {
        label: 'Cardápio',
        path: '/cardapio',
        icon: Package,
        permission: 'products.read',
        description: 'Gerenciar produtos'
      },
      {
        label: 'Estoque',
        path: '/estoque/notas-entrada',
        icon: Package,
        permissions: ['products.read', 'products.update'],
        description: 'Controle de estoque'
      },
      {
        label: 'Caixa',
        path: '/caixa',
        icon: Calculator,
        permission: 'cashier.read',
        description: 'Gestão de caixa'

    ]
  },
  {
    title: 'Configurações',
    items: [
      {
        label: 'Estabelecimento',
        path: '/settings/estabelecimento',
        icon: Building,
        permission: 'settings.manage',
        description: 'Dados da empresa'
      },
      {
        label: 'Configurações',
        path: '/settings',
        icon: Settings,
        permission: 'settings.manage',
        description: 'Configurações gerais'
      },
      {
        label: 'Editor de Prompts IA',
        path: '/admin/prompts',
        icon: Code,
        superAdminOnly: true,
        description: 'Editor unificado de prompts e configurações'

    ]
  },
  {
    title: 'Administração',
    items: [
      {
        label: 'Usuários',
        path: '/admin/user-management',
        icon: Users,
        permission: 'users.read',
        adminOnly: true,
        description: 'Gerenciar usuários'
      },
      {
        label: 'Empresas',
        path: '/empresas',
        icon: Building,
        permission: 'stores.read',
        superAdminOnly: true,
        description: 'Gerenciar empresas'
      },
      {
        label: 'Relatórios',
        path: '/reports',
        icon: BarChart3,
        permission: 'reports.read',
        adminOnly: true,
        description: 'Relatórios avançados'
      },
      {
        label: 'Links Teste',
        path: '/links-teste',
        icon: ExternalLink,
        superAdminOnly: true,
        description: 'Sistema de links curtos'
      },
    ]

];

export const PermissionBasedNavigation: React.FC = () => {
  const location = useLocation()
  const { hasPermission } = usePermissions()

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    const content = (
      <Link
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          isActive && "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-4 w-4" />
        <div className="flex-1">
          <div className="font-medium">{item.label}</div>
          {item.description && (
            <div className="text-xs text-gray-500">{item.description}</div>
          )}
        </div>
      </Link>;
    )

    // Verificar permissões específicas
    if (item.superAdminOnly) {
      return (
        <SuperAdminOnly key={item.path}>
          {content}
        </SuperAdminOnly>
      )
    }

    if (item.adminOnly) {
      return (
        <AdminOnly key={item.path}>
          {content}
        </AdminOnly>
      )
    }

    if (item.permission || item.permissions) {
      return (
        <PermissionGuard
          key={item.path}
          permission={item.permission}
          permissions={item.permissions}
          requireAll={item.requireAll}
          showFallback={false}
        >
          {content}
        </PermissionGuard>
      )
    }

    return <div key={item.path}>{content}</div>;
  };

  const renderSection = (section: NavSection) => {
    // Verificar se pelo menos um item da seção é visível
    const hasVisibleItems = section.items.some(item => {
      if (item.superAdminOnly) return hasPermission('*') // Super admin
      if (item.adminOnly) return hasPermission('users.read') // Algum admin
      if (item.permission) return hasPermission(item.permission)
      if (item.permissions) {
        return item.requireAll 
          ? item.permissions.every(p => hasPermission(p))
          : item.permissions.some(p => hasPermission(p))

      return true;
    })

    if (!hasVisibleItems) return null;

    return (
      <div key={section.title} className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500 px-3">
          {section.title}
        </h3>
        <div className="space-y-1">
          {section.items.map(renderNavItem)}
        </div>
      </div>
    )
  };

  return (
    <nav className="space-y-6">
      {navigationSections.map(renderSection)}
    </nav>
  )
};

// Exemplo de uso em um componente de permissões inline
export const PermissionDisplay: React.FC = () => {
  const { userPermissions, hasRole, isAdmin, isSuperAdmin } = usePermissions()

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Suas Permissões
      </h4>
      
      <div className="space-y-2">
        <div className="text-sm">
          <strong>Tipo de usuário:</strong>{' '}
          {isSuperAdmin() && 'Super Administrador'}
          {!isSuperAdmin() && isAdmin() && 'Administrador'}
          {!isAdmin() && 'Usuário'}
        </div>
        
        <div className="text-sm">
          <strong>Permissões ({userPermissions.length}):</strong>
        </div>
        
        <div className="max-h-32 overflow-y-auto">
          <div className="grid grid-cols-1 gap-1 text-xs">
            {userPermissions.map((permission, index) => (
              <div key={index} className="bg-white px-2 py-1 rounded border">
                <span className="font-mono">{permission.slug}</span>
                <span className="text-gray-500 ml-2">
                  ({permission.module}.{permission.action})
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {userPermissions.length === 0 && (
          <div className="text-xs text-gray-500 italic">
            Nenhuma permissão específica encontrada
          </div>
        )}
      </div>
    </div>
  )
};
