import React, { useState } from 'react';
import { Plus, ExternalLink, Edit, Trash2, Users, Globe, Crown, Zap, Award, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CompanyDialog } from '@/components/CompanyDialog';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/hooks/useCompanies';

interface Company {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  plan: string;
  status: string;
  user_count: number;
  store_code: number;
  slug?: string;
  created_at: string;


export const CompaniesPage = () => {;
  const { companies, isLoading: loading, createCompany, updateCompany, deleteCompany, isCreating, isUpdating, isDeleting } = useCompanies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { selectCompany, user } = useAuth();
  const navigate = useNavigate();

  // Proteger a página - apenas super admins podem gerenciar empresas
  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas super administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  const handleEdit = (company: Company) => {;
    setEditingCompany(company);
    setDialogOpen(true);
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {;
      return;
    }

    deleteCompany(company.id);
  };

  const handleDialogClose = () => {;
    setDialogOpen(false);
    setEditingCompany(null);
  };

  const filteredCompanies = (() => {;
    if (!searchTerm) return companies;
    
    return companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })();

  const getCompanyInitials = (name: string) => {;
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  };

  const getPlanConfig = (plan: string) => {
    const configs = {
      basic: { 
        label: 'Basic', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Globe
      },
      pro: { 
        label: 'Pro', 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Crown
      },
      enterprise: { 
        label: 'Enterprise', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: Award
      };
    };
    return configs[plan] || configs.basic;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { 
        label: 'Ativo', 
        color: 'bg-green-100 text-green-800 border-green-200',
        dot: 'bg-green-500'
      },
      inactive: { 
        label: 'Inativo', 
        color: 'bg-red-100 text-red-800 border-red-200',
        dot: 'bg-red-500'
      },
      suspended: { 
        label: 'Suspenso', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        dot: 'bg-yellow-500'
      };
    };
    return configs[status] || configs.active;
  };

  const handleLoginAsAdmin = (company: Company) => {
    // Selecionar a empresa no contexto de autenticação;
    selectCompany(company);
    
    toast({
      title: 'Acesso concedido',
      description: `Agora você está logado como admin da empresa: ${company.name}`,
    });
    
    // Redirecionar para o dashboard da empresa
    navigate('/pedidos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Globe className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Gerenciar Empresas
              </h1>
              <p className="text-gray-600">
                Gerencie todas as empresas do sistema
              </p>
            </div>
            <button 
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
              onClick={() => setDialogOpen(true)}
            >
              + Nova
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Empresas</p>
                <p className="text-lg font-bold text-gray-900">{companies.length}</p>
              </div>
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Usuários</p>
                <p className="text-lg font-bold text-gray-900">
                  {companies.reduce((sum, company) => sum + company.user_count, 0)}
                </p>
              </div>
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Ativas</p>
                <p className="text-lg font-bold text-gray-900">
                  {companies.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Domínio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usuários
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => {
                  const planConfig = getPlanConfig(company.plan);
                  const statusConfig = getStatusConfig(company.status);
                  const PlanIcon = planConfig.icon;
                  
                  return (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              {getCompanyInitials(company.name)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {company.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 font-medium">
                            {company.domain}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${planConfig.color}`}>
                          <PlanIcon className="w-3 h-3 mr-1" />
                          {planConfig.label}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${statusConfig.dot}`}></div>
                          {statusConfig.label}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 font-medium">
                            {company.user_count}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="Acessar empresa"
                            onClick={() => handleLoginAsAdmin(company)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                            title="Editar empresa"
                            onClick={() => handleEdit(company)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Excluir empresa"
                            onClick={() => handleDelete(company)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state (when no companies) */}
        {companies.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma empresa encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando sua primeira empresa no sistema.
            </p>
            <button 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Empresa
            </button>
          </div>
        )}
      </div>

      <CompanyDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        company={editingCompany}
        onSave={async (formData, invitationEmail) => {
          if (editingCompany) {
            updateCompany({ ...formData, id: editingCompany.id });
          } else {
            createCompany(formData);
          }
        }}
        loading={isCreating || isUpdating}
      />
    </div>
  );
};