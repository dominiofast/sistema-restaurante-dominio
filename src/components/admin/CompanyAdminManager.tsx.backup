import React, { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Building, Key, CheckCircle, AlertCircle, Shield, Settings, Plus, Edit } from 'lucide-react';
import { PermissionGuard, SuperAdminOnly } from '@/components/auth/PermissionGuard';
import { usePermissions } from '@/contexts/PermissionsContext';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Company {
  id: string;
  name: string;
  domain: string;
  status: string;
}

interface CompanyWithUser extends Company {
  has_admin_user: boolean;
  admin_email?: string;
  admin_role?: string;
  admin_user_id?: string;
}

export const CompanyAdminManager: React.FC = () => {
  const { roles } = usePermissions();
  const [companies, setCompanies] = useState<CompanyWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, email: string, role?: string} | null>(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as empresas ativas
      const { data: companiesData, error: companiesError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'companies')
        /* .select\( REMOVIDO */ ; //'id, name, domain, status')
        /* .eq\( REMOVIDO */ ; //'status', 'active')
        /* .order\( REMOVIDO */ ; //'name');

      if (companiesError) throw companiesError;

      // Verificar quais empresas já têm usuário admin
      const companiesWithUserStatus = await Promise.all(
        (companiesData || []).map(async (company) => {
          const expectedEmail = `${company.domain}@dominiopizzas.com.br`;
          
          // Verificar se existe usuário com esse email
          const { data: userData } = /* await supabase REMOVIDO */ null
            /* .from REMOVIDO */ ; //'company_credentials')
            /* .select\( REMOVIDO */ ; //'email')
            /* .eq\( REMOVIDO */ ; //'company_id', company.id)
            /* .eq\( REMOVIDO */ ; //'email', expectedEmail)
            /* .maybeSingle\( REMOVIDO */ ; //);

          // Buscar dados do usuário no auth.users se existe
          let userRole = null;
          let userId = null;
          if (userData) {
            try {
              const { data: authData } = await /* supabase REMOVIDO */ null; //auth.admin.listUsers();
              const authUser = authData?.users?.find((u: any) => u.email === expectedEmail);
              userRole = authUser?.user_metadata?.role;
              userId = authUser?.id;
            } catch (authError) {
              console.log('Erro ao buscar dados do usuário:', authError);
            }
          }

          return {
            ...company,
            has_admin_user: !!userData,
            admin_email: expectedEmail,
            admin_role: userRole,
            admin_user_id: userId
          };
        })
      );

      setCompanies(companiesWithUserStatus);
    } catch (error: any) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async (company: Company) => {
    try {
      setCreating(company.id);
      
      const adminEmail = `${company.domain}@dominiopizzas.com.br`;
      const tempPassword = `admin${company.domain}123`;

      // Chamar a Edge Function para criar o usuário
      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('create-company-admin', {
        body: {
          company_id: company.id,
          company_domain: company.domain,
          company_name: company.name
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Usuário admin criado para ${company.name}!`);
        toast.info(`Email: ${adminEmail} | Senha temporária: ${tempPassword}`);
        
        // Recarregar a lista
        loadCompanies();
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário admin:', error);
      toast.error(`Erro ao criar usuário admin: ${error.message}`);
    } finally {
      setCreating(null);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Usuários Admin
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários administradores para cada empresa. 
            Quando uma nova empresa é criada, um usuário admin é automaticamente criado.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{company.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Domínio: {company.domain}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email admin: {company.admin_email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {company.has_admin_user ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Admin criado</span>
                      </div>
                      {company.admin_role && (
                        <Badge variant="outline">
                          {company.admin_role === 'super_admin' ? 'Super Admin' : 
                           company.admin_role === 'admin' ? 'Admin' : 
                           company.admin_role === 'store_admin' ? 'Admin Loja' : 'Usuário'}
                        </Badge>
                      )}
                      <SuperAdminOnly>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser({
                              id: company.admin_user_id || '',
                              email: company.admin_email || '',
                              role: company.admin_role
                            });
                            setPermissionDialogOpen(true);
                          }}
                          className="gap-2"
                          disabled={!company.admin_user_id}
                        >
                          <Shield className="h-4 w-4" />
                          Gerenciar Permissões
                        </Button>
                      </SuperAdminOnly>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Sem admin</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => createAdminUser(company)}
                        disabled={creating === company.id}
                        className="gap-2"
                      >
                        <Key className="h-4 w-4" />
                        {creating === company.id ? 'Criando...' : 'Criar Admin'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🤖 Automação Ativa</h4>
            <p className="text-sm text-blue-700">
              Para novas empresas: O sistema automaticamente cria todas as configurações 
              (branding, métodos de entrega, formas de pagamento) e registra a necessidade 
              de criar o usuário admin. Use esta interface para criar os usuários quando necessário.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Gerenciamento de Permissões */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Gerenciar Permissões - {selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Alterar Role do Usuário</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Selecione o role que define as permissões básicas do usuário
              </p>
              <Select 
                value={selectedUser?.role || ''} 
                onValueChange={async (newRole) => {
                  if (!selectedUser?.id) return;
                  
                  try {
                    const { error } = await /* supabase REMOVIDO */ null; //auth.admin.updateUserById(
                      selectedUser.id,
                      {
                        user_metadata: { role: newRole }
                      }
                    );
                    
                    if (error) throw error;
                    
                    toast.success('Role atualizado com sucesso!');
                    setSelectedUser(prev => prev ? {...prev, role: newRole} : null);
                    loadCompanies(); // Recarregar para ver mudanças
                  } catch (error: any) {
                    toast.error('Erro ao atualizar role: ' + error.message);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.slug}>
                      <div className="flex items-center gap-2">
                        <span>{role.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {role.slug}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-medium">Informações de Permissões</Label>
              <div className="grid gap-3 mt-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Roles Disponíveis:</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div><strong>Super Admin:</strong> Acesso total ao sistema</div>
                    <div><strong>Support:</strong> Suporte técnico com acesso limitado</div>
                    <div><strong>Store Admin:</strong> Gerencia múltiplas lojas</div>
                    <div><strong>Store:</strong> Acesso apenas à própria loja</div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Role Atual:</h4>
                  <Badge variant="outline">
                    {selectedUser?.role || 'Não definido'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};