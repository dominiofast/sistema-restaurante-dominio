import React, { ReactNode } from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  storeId?: string;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  storeId,
  fallback,
  showFallback = true
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const checkPermissions = (): boolean => {
    // Se especificou uma permissão única
    if (permission) {
      return hasPermission(permission, storeId);
    }

    // Se especificou múltiplas permissões
    if (permissions && permissions.length > 0) {
      return requireAll 
        ? hasAllPermissions(permissions, storeId)
        : hasAnyPermission(permissions, storeId);
    }

    // Se não especificou permissões, permite acesso
    return true;
  };

  const isAuthorized = checkPermissions();

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showFallback) {
      return (
        <Alert className="border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            Você não tem permissão para acessar esta funcionalidade.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Componente para mostrar conteúdo apenas para admins
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin()) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Componente para mostrar conteúdo apenas para super admins
export const SuperAdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  const { isSuperAdmin } = usePermissions();

  if (!isSuperAdmin()) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Componente para mostrar informações de role
export const RoleDisplay: React.FC = () => {
  const { hasRole, isSuperAdmin, isAdmin } = usePermissions();

  return (
    <div className="flex items-center gap-2 text-sm">
      <Shield className="h-4 w-4" />
      <span>
        {isSuperAdmin() && 'Super Admin'}
        {!isSuperAdmin() && isAdmin() && 'Admin'}
        {!isAdmin() && 'Usuário'}
      </span>
    </div>
  );
};