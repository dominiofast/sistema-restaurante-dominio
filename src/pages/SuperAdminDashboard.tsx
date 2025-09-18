import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart3, Bot, Settings, Users, Building2, ArrowRight, UserPlus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Stat {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

interface RecentCompany {
  id: string;
  name: string;
  created_at: string;
  owner_email?: string;
}

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<RecentCompany[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados via APIs do Neon
        const [companiesResponse, recentCompaniesResponse] = await Promise.all([
          fetch('/api/companies', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/companies', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
        ]);

        if (!companiesResponse.ok || !recentCompaniesResponse.ok) {
          throw new Error('Erro ao buscar dados do dashboard');
        }

        const companiesResult = await companiesResponse.json();
        const recentCompaniesResult = await recentCompaniesResponse.json();

        if (!companiesResult.success || !recentCompaniesResult.success) {
          throw new Error('Erro na resposta da API');
        }

        const totalCompanies = companiesResult.data?.length || 0;
        const recentCompaniesList = (recentCompaniesResult.data || [])
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        setRecentCompanies(recentCompaniesList);

        // Para outras estatísticas, usar valores mockados por enquanto
        // TODO: Implementar APIs específicas para essas estatísticas
        const activeAgents = 0; // Mock - implementar API específica
        const tokensUsedToday = 0; // Mock - implementar API específica  
        const newCustomersToday = 0; // Mock - implementar API específica

        setStats([
          { title: 'Total de Empresas', value: totalCompanies || 0, icon: Building2, color: 'text-blue-600' },
          { title: 'Agentes de IA Ativos', value: activeAgents || 0, icon: Bot, color: 'text-green-600' },
          { title: 'Tokens Usados Hoje', value: tokensUsedToday.toLocaleString(), icon: Settings, color: 'text-purple-600' },
          { title: 'Novos Clientes Hoje', value: newCustomersToday || 0, icon: UserPlus, color: 'text-orange-600' }
        ]);

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast.error('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard do Super Admin</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name || 'Admin'}. Aqui está um resumo do sistema.</p>
        
        {/* Instrução para selecionar empresa */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">
            💡 Dica: Use o seletor de empresas no cabeçalho para acessar as configurações específicas de cada loja.
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Quando uma empresa for selecionada, o menu lateral mostrará apenas as opções daquela empresa.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-gray-100 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Companies */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {recentCompanies.map(company => (
                  <li key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800">{company.name}</p>
                      <p className="text-sm text-gray-500">
                        Registrada em: {new Date(company.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/empresas/${company.id}`}>
                        Ver
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start gap-3">
                <Link to="/empresas"><Building2 className="w-4 h-4" />Gerenciar Empresas</Link>
              </Button>
              <Button asChild className="w-full justify-start gap-3">
                <Link to="/admin/company-users"><UserPlus className="w-4 h-4" />Usuários Admin</Link>
              </Button>
              <Button asChild className="w-full justify-start gap-3">
                <Link to="/logs"><FileText className="w-4 h-4" />Logs do Sistema</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard; 