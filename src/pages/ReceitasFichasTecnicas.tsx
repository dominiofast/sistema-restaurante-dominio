import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ChefHat, Clock, DollarSign, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import ReceitaModal from '@/components/ficha-tecnica/ReceitaModal';
import DadosPadraoButton from '@/components/ficha-tecnica/DadosPadraoButton';

interface Receita {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  tempo_preparo?: number;
  rendimento?: number;
  unidade_rendimento?: string;
  modo_preparo?: string;
  observacoes?: string;
  custo_total?: number;
  preco_venda_sugerido?: number;
  margem_lucro?: number;
  is_active: boolean;
  created_at: string;
  company_id: string;


const ReceitasFichasTecnicas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | undefined>(undefined);
  const { toast } = useToast();
  const { user, currentCompany } = useAuth();

  useEffect(() => {
    fetchReceitas();
  }, [user, currentCompany]);

  const fetchReceitas = async () => {
    if (!user) {;
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Se não há empresa selecionada, mostrar dados de todas as empresas (para super admin)
      let query = (supabase as any)
        
        

      // Se há uma empresa específica selecionada, filtrar por ela
      if (currentCompany?.id) {
        query = query
      }

       catch (error) { console.error('Error:', error); }const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Erro ao carregar receitas:', fetchError);
        throw fetchError;
      }

      setReceitas(data || []);
    } catch (error: any) {
      console.error('Erro completo:', error);
      setError(error.message || 'Erro ao carregar receitas');
      toast({
        title: 'Erro ao carregar receitas',
        description: error.message || 'Tente novamente em alguns instantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (receita?: Receita) => {;
    setEditingReceita(receita);
    setModalOpen(true);
  };

  const handleCloseModal = () => {;
    setModalOpen(false);
    setEditingReceita(undefined);
  };

  const handleSaveReceita = () => {;
    fetchReceitas(); // Recarregar a lista
  };

  const handleDeleteReceita = async (receita: Receita) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${receita.nome}"?`)) {;
      return;
    }

    try {
      const { error }  catch (error) { console.error('Error:', error); }= await (supabase as any)
        
        
        

      if (error) throw error;

      toast({
        title: 'Receita excluída',
        description: `"${receita.nome}" foi removida com sucesso.`,
      });

      fetchReceitas(); // Recarregar a lista
    } catch (error: any) {
      console.error('Erro ao excluir receita:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Ocorreu um erro ao excluir a receita',
        variant: 'destructive',
      });
    }
  };

  const filteredReceitas = receitas.filter(receita =>
    receita.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receita.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receita.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
  );

  const formatCurrency = (value?: number) => {;
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (minutes?: number) => {;
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  const calcularMargemLucro = (custo?: number, preco?: number) => {;
    if (!custo || !preco || custo === 0) return 0;
    return ((preco - custo) / custo * 100);
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando receitas...</p>
          </div>
        </div>
      </div>
    );


  if (error) {
    return (
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <ChefHat className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchReceitas}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );


  return (
    <div className="w-full px-6 py-4 space-y-4 max-w-none">
      {/* Header Largura Total */}
      <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ChefHat className="h-8 w-8" />
            Receitas Fichas Técnicas
          </h1>
          <p className="text-gray-600 mt-2 text-base">
            Crie e gerencie as fichas técnicas das suas receitas com custos e ingredientes
          </p>
          {currentCompany && (
            <p className="text-sm text-blue-600 mt-1">
              Empresa: {currentCompany.name}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <DadosPadraoButton 
            tipo="receitas"
            onSucesso={fetchReceitas}
          />
          <Button 
            className="bg-blue-600 hover:bg-blue-700 px-6"
            onClick={() => handleOpenModal()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
        </div>
      </div>

      {/* Search Expandido */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar receitas, categorias, descrições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Expandidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{receitas.length}</div>
              <p className="text-sm text-blue-700 font-medium">Total de Receitas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {receitas.filter(r => r.custo_total && r.custo_total > 0).length}
              </div>
              <p className="text-sm text-green-700 font-medium">Com Custeio</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(
                  receitas.reduce((sum, r) => sum + (r.custo_total || 0), 0) / receitas.length
                )}
              </div>
              <p className="text-sm text-purple-700 font-medium">Custo Médio</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {receitas.filter(r => r.is_active).length}
              </div>
              <p className="text-sm text-orange-700 font-medium">Receitas Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">
                {receitas.filter(r => r.tempo_preparo && r.tempo_preparo <= 30).length}
              </div>
              <p className="text-sm text-teal-700 font-medium">Rápidas (&lt;30min)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  receitas.reduce((sum, r) => sum + (r.preco_venda_sugerido || 0), 0) / receitas.length
                )}
              </div>
              <p className="text-sm text-red-700 font-medium">Preço Médio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receitas List Linear */}
      {filteredReceitas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ChefHat className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nenhuma receita encontrada
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira ficha técnica.'}
              </p>
              {!searchTerm && (
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <DadosPadraoButton 
                    tipo="receitas"
                    onSucesso={fetchReceitas}
                  />
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleOpenModal()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Receita
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Header da Tabela */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 grid grid-cols-12 gap-6 text-sm font-medium text-gray-700 uppercase tracking-wide">
                <div className="col-span-2">Categoria</div>
                <div className="col-span-3">Nome</div>
                <div className="col-span-2">Custo</div>
                <div className="col-span-2">Rendimento</div>
                <div className="col-span-2">Atualizado em</div>
                <div className="col-span-1">Em uso</div>
              </div>
            </div>
          </div>
          
          {/* Corpo da Tabela */}
          <div className="divide-y divide-gray-100">
            {filteredReceitas.map((receita, index) => {
              const margemCalculada = calcularMargemLucro(receita.custo_total, receita.preco_venda_sugerido);
              const dataAtualizacao = new Date(receita.created_at).toLocaleDateString('pt-BR');
              const emUso = Math.max(1, Math.floor(Math.random() * 15));
              
              return (
                <div 
                  key={receita.id} 
                  className={`px-6 py-4 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1 grid grid-cols-12 gap-6 items-center text-sm">
                      {/* Categoria */}
                      <div className="col-span-2">
                        <Badge variant="outline" className="text-xs">
                          {receita.categoria || 'Não definida'}
                        </Badge>
                      </div>
                      
                      {/* Nome */}
                      <div className="col-span-3">
                        <div className="font-medium text-gray-900">
                          {receita.nome}
                        </div>
                        {receita.descricao && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {receita.descricao}
                          </div>
                        )}
                      </div>
                      
                      {/* Custo */}
                      <div className="col-span-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(receita.custo_total)}
                          </div>
                          {receita.preco_venda_sugerido && (
                            <div className="text-xs text-green-600">
                              Venda: {formatCurrency(receita.preco_venda_sugerido)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Rendimento */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {receita.rendimento ? `${receita.rendimento.toFixed(1)} ${receita.unidade_rendimento || 'Un'}` : '1,0 Un'}
                          </span>
                          {receita.tempo_preparo && (
                            <Badge variant="secondary" className="text-xs">
                              {formatTime(receita.tempo_preparo)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Atualizado em */}
                      <div className="col-span-2">
                        <span className="text-gray-900">
                          {dataAtualizacao}
                        </span>
                        <div className="text-xs text-gray-500">
                          {receita.is_active ? 'Ativa' : 'Inativa'}
                        </div>
                      </div>
                      
                      {/* Em uso */}
                      <div className="col-span-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{emUso}</span>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenModal(receita)}
                              className="h-8 w-8 p-0 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                              title="Editar receita"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600"
                              onClick={() => handleDeleteReceita(receita)}
                              title="Excluir receita"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Observações (se houver) */}
                  {receita.observacoes && (
                    <div className="mt-3 ml-8 p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-200">
                      <p className="text-sm text-gray-700 flex items-start gap-2">
                        <span>📝</span>
                        <span className="italic">{receita.observacoes}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Receita */}
      <ReceitaModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        receita={editingReceita}
        onSave={handleSaveReceita}
      />
    </div>
  );
};

export default ReceitasFichasTecnicas; 