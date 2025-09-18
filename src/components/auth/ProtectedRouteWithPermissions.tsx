import React, { ReactNode } from 'react';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteWithPermissionsProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  storeId?: string;
}

export const ProtectedRouteWithPermissions: React.FC<ProtectedRouteWithPermissionsProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  storeId
}) => {
  const { isAuthorized, loading } = usePermissionGuard({
    permission,
    permissions,
    requireAll,
    storeId,
    redirectTo: '/unauthorized',
    showToast: true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verificando permissões...</span>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null; // O hook já cuida do redirecionamento
  }

  return <>{children}</>;
};
