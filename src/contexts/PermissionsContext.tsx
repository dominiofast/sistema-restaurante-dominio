import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// // SUPABASE REMOVIDO
// DESABILITADO - Sistema migrado para PostgreSQL
import { useAuth } from './AuthContext';

// Tipos
export interface Permission {
  id: string;
  name: string;
  slug: string;
  module: string;
  action: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

export interface UserPermission {
  slug: string;
  module: string;
  action: string;
}

interface PermissionsContextType {
  permissions: Permission[];
  roles: Role[];
  userPermissions: UserPermission[];
  loading: boolean;
  
  // Verificar permissões
  hasPermission: (permission: string, storeId?: string) => boolean;
  hasAnyPermission: (permissions: string[], storeId?: string) => boolean;
  hasAllPermissions: (permissions: string[], storeId?: string) => boolean;
  
  // Verificar roles
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  
  // Gerenciar permissões
  refreshPermissions: () => Promise<void>;
  grantPermission: (userId: string, permissionSlug: string, storeId?: string, expiresAt?: string) => Promise<boolean>;
  revokePermission: (userId: string, permissionSlug: string, storeId?: string) => Promise<boolean>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  // MOCK - Carregar todas as permissões disponíveis (DESABILITADO)
  const loadPermissions = async () => {
    console.log('⚠️ loadPermissions desabilitado - sistema migrado para PostgreSQL');
    return Promise.resolve([
      // Permissões mock removidas - sistema migrado para PostgreSQL
    ]);
  };

  // MOCK - Carregar todos os roles disponíveis (DESABILITADO)
  const loadRoles = async () => {
    console.log('⚠️ loadRoles desabilitado - sistema migrado para PostgreSQL');
    return Promise.resolve([
      // Roles mock removidas - sistema migrado para PostgreSQL
    ]);
  };

  // Carregar permissões do usuário atual
  const loadUserPermissions = async () => {
    console.log('⚠️ loadUserPermissions desabilitado - sistema migrado para PostgreSQL');
    return Promise.resolve([]);
  };

  const loadUserPermissionsOld = async () => {
    try {
      const userRole = user.user_metadata?.role;
      
      if (!userRole) {
        setUserPermissions([]);
        return;
      }

      // Buscar permissões via role (DESABILITADO - sistema migrado para PostgreSQL)
      // const { data, error } = await supabase
      //   .from('roles')
      //   .select(`
      //     role_permissions!inner(
      //       permissions!inner(
      //         slug,
      //         module,
      //         action
      //       )
      //     )
      //   `)
      //   .eq('slug', userRole)
      //   .eq('is_active', true);
      const data = null; const error = null;

      if (error) throw error;

      const rolePermissions: UserPermission[] = [];
      
      data?.forEach(role => {
        role.role_permissions?.forEach((rp: any) => {
          if (rp.permissions) {
            rolePermissions.push({
              slug: rp.permissions.slug,
              module: rp.permissions.module,
              action: rp.permissions.action
            });
          }
        });
      });

      // Buscar permissões específicas por contexto (DESABILITADO)
      // const { data: contextPermissions, error: contextError } = await supabase
      //   .from('user_store_permissions')
      //   .select(`
      //     permissions!inner(
      //       slug,
      //       module,
      //       action
      //     )
      const contextPermissions = null; const contextError = null;
      //   `)
      //   .eq('user_id', user.id)
      //   .or('expires_at.is.null,expires_at.gt.now()');

      if (contextError) throw contextError;

      const specificPermissions: UserPermission[] = [];
      
      contextPermissions?.forEach((usp: any) => {
        if (usp.permissions) {
          specificPermissions.push({
            slug: usp.permissions.slug,
            module: usp.permissions.module,
            action: usp.permissions.action
          });
        }
      });

      // Combinar permissões (remover duplicatas)
      const allPermissions = [...rolePermissions, ...specificPermissions];
      const uniquePermissions = allPermissions.filter(
        (permission, index, self) => 
          index === self.findIndex(p => p.slug === permission.slug)
      );

      setUserPermissions(uniquePermissions);
    } catch (error) {
      console.error('Erro ao carregar permissões do usuário:', error);
      setUserPermissions([]);
    }
  };

  // Verificar se usuário tem permissão específica
  const hasPermission = (permission: string, storeId?: string): boolean => {
    // Super admins têm todas as permissões
    if (isSuperAdmin()) return true;
    
    // Verificar se tem a permissão
    return userPermissions.some(p => p.slug === permission);
  };

  // Verificar se usuário tem qualquer uma das permissões
  const hasAnyPermission = (permissions: string[], storeId?: string): boolean => {
    return permissions.some(permission => hasPermission(permission, storeId));
  };

  // Verificar se usuário tem todas as permissões
  const hasAllPermissions = (permissions: string[], storeId?: string): boolean => {
    return permissions.every(permission => hasPermission(permission, storeId));
  };

  // Verificar se usuário tem role específico
  const hasRole = (role: string): boolean => {
    const userRole = user?.user_metadata?.role;
    return userRole === role;
  };

  // Verificar se é admin (qualquer tipo)
  const isAdmin = (): boolean => {
    const userRole = user?.user_metadata?.role;
    return ['super_admin', 'admin', 'store_admin'].includes(userRole);
  };

  // Verificar se é super admin
  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  // Recarregar todas as permissões
  const refreshPermissions = async (): Promise<void> => {
    setLoading(true);
    await Promise.all([
      loadPermissions(),
      loadRoles(),
      loadUserPermissions()
    ]);
    setLoading(false);
  };

  // Conceder permissão específica
  const grantPermission = async (
    userId: string, 
    permissionSlug: string, 
    storeId?: string, 
    expiresAt?: string
  ): Promise<boolean> => {
    try {
      // Buscar ID da permissão
      const { data: permission } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'permissions')
        /* .select\( REMOVIDO */ ; //'id')
        /* .eq\( REMOVIDO */ ; //'slug', permissionSlug)
        /* .single\( REMOVIDO */ ; //);

      if (!permission) throw new Error('Permissão não encontrada');

      // const { error } = await supabase
      //   .from('user_store_permissions')
      //   .upsert({
      //     user_id: userId,
      //     store_id: storeId || null,
      //     permission_id: permission.id,
      //     granted_by: user?.id,
      //     expires_at: expiresAt || null
      //   });
      const error = null;

      if (error) throw error;

      // Recarregar permissões se é para o usuário atual
      if (userId === user?.id) {
        await loadUserPermissions();
      }

      return true;
    } catch (error) {
      console.error('Erro ao conceder permissão:', error);
      return false;
    }
  };

  // Revogar permissão específica
  const revokePermission = async (
    userId: string, 
    permissionSlug: string, 
    storeId?: string
  ): Promise<boolean> => {
    try {
      // Buscar ID da permissão
      const { data: permission } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'permissions')
        /* .select\( REMOVIDO */ ; //'id')
        /* .eq\( REMOVIDO */ ; //'slug', permissionSlug)
        /* .single\( REMOVIDO */ ; //);

      if (!permission) throw new Error('Permissão não encontrada');

      const { error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'user_store_permissions')
        /* .delete\( REMOVIDO */ ; //)
        /* .eq\( REMOVIDO */ ; //'user_id', userId)
        /* .eq\( REMOVIDO */ ; //'permission_id', permission.id)
        /* .eq\( REMOVIDO */ ; //'store_id', storeId || null);

      if (error) throw error;

      // Recarregar permissões se é para o usuário atual
      if (userId === user?.id) {
        await loadUserPermissions();
      }

      return true;
    } catch (error) {
      console.error('Erro ao revogar permissão:', error);
      return false;
    }
  };

  // Inicializar dados
  useEffect(() => {
    if (user) {
      refreshPermissions();
    } else {
      setPermissions([]);
      setRoles([]);
      setUserPermissions([]);
      setLoading(false);
    }
  }, [user]);

  const value: PermissionsContextType = {
    permissions,
    roles,
    userPermissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isSuperAdmin,
    refreshPermissions,
    grantPermission,
    revokePermission
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};