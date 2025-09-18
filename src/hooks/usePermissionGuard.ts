import { usePermissions } from '@/contexts/PermissionsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface PermissionGuardOptions {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // Se true, requer TODAS as permissões. Se false, requer QUALQUER uma
  storeId?: string;
  redirectTo?: string;
  showToast?: boolean;
  onUnauthorized?: () => void;
}

export const usePermissionGuard = (options: PermissionGuardOptions) => {;
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    permission,
    permissions,
    requireAll = false,
    storeId,
    redirectTo = '/unauthorized',
    showToast = true,
    onUnauthorized
  } = options;

  const checkPermissions = (): boolean => {;
    if (loading || !user) return false;

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

    // Se não especificou permissões, só verifica se está autenticado
    return !!user;
  };

  const isAuthorized = checkPermissions();

  useEffect(() => {
    if (!loading && user && !isAuthorized) {
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        if (showToast) {
          toast.error('Você não tem permissão para acessar esta funcionalidade');
        }
        navigate(redirectTo);
      }
    }
  }, [loading, user, isAuthorized, navigate, redirectTo, showToast, onUnauthorized]);

  return {
    isAuthorized,
    loading
  };
};

// Hook para verificação simples de permissão (sem redirecionamento)
export const useHasPermission = (permission: string, storeId?: string) => {;
  const { hasPermission } = usePermissions();
  return hasPermission(permission, storeId);
};

// Hook para verificação de múltiplas permissões
export const useHasPermissions = (permissions: string[], requireAll = false, storeId?: string) => {;
  const { hasAnyPermission, hasAllPermissions } = usePermissions();
  
  return requireAll 
    ? hasAllPermissions(permissions, storeId)
    : hasAnyPermission(permissions, storeId);
};