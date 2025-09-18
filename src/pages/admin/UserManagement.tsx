import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';
import { PermissionGuard, SuperAdminOnly } from '@/components/auth/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Plus, Edit, Trash2 } from 'lucide-react';
// SUPABASE REMOVIDO
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  role?: string;
  created_at: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
}

const UserManagement: React.FC = () => {
  const { roles, hasPermission } = usePermissions()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Buscar usuários (apenas super admins podem ver todos)
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
      if (error) throw error;
      
      setUsers(data.users.map(user => ({
        id: user.id,
        email: user.email || '',
        role: user.raw_user_meta_data?.role || user.user_metadata?.role,
        created_at: user.created_at,
        user_metadata: user.user_metadata
      })))
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)

  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'super_admin':;
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'store_admin':
        return 'bg-green-100 text-green-800';
      case 'store':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';

  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'super_admin':;
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'store_admin':
        return 'Admin de Lojas';
      case 'store':
        return 'Loja';
      default:
        return 'Usuário';

  };

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
        </div>
        
        <PermissionGuard permission="users.create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Lista de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">
                          {user.user_metadata?.name || user.email}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <PermissionGuard permission="users.update">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                    
                    <SuperAdminOnly>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </SuperAdminOnly>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <SuperAdminOnly>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-red-600">Área de Super Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Apenas super administradores podem ver esta seção.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium">Total de Usuários</h4>
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium">Super Admins</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.role === 'super_admin').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium">Roles Disponíveis</h4>
                  <p className="text-2xl font-bold text-green-600">{roles.length}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </SuperAdminOnly>
    </div>
  )
};

export default UserManagement;
