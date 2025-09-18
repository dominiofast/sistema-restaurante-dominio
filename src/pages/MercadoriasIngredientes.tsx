import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import MercadoriaModal from '@/components/ficha-tecnica/MercadoriaModal';
import DadosPadraoButton from '@/components/ficha-tecnica/DadosPadraoButton';

interface Mercadoria {
  id: string;
  nome: string;
  descricao?: string;
  unidade_medida: string;
  categoria?: string;
  preco_unitario?: number;
  estoque_atual: number;
  estoque_minimo: number;
  fornecedor?: string;
  codigo_produto?: string;
  observacoes?: string;
  is_active: boolean;
  created_at: string;
  company_id: string;


const MercadoriasIngredientes: React.FC = () => {
  const [mercadorias, setMercadorias] = useState<Mercadoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMercadoria, setEditingMercadoria] = useState<Mercadoria | undefined>(undefined);
  const { toast } = useToast();
  const { user, currentCompany } = useAuth();

  useEffect(() => {
    fetchMercadorias();
  }, [user, currentCompany]);

  const fetchMercadorias = async () => {
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
        console.error('Erro ao carregar mercadorias:', fetchError);
        throw fetchError;
      }

      setMercadorias(data || []);
    } catch (error: any) {
      console.error('Erro completo:', error);
      setError(error.message || 'Erro ao carregar mercadorias');
      toast({
        title: 'Erro ao carregar mercadorias',
        description: error.message || 'Tente novamente em alguns instantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mercadoria?: Mercadoria) => {;
    setEditingMercadoria(mercadoria);
    setModalOpen(true);
  };

  const handleCloseModal = () => {;
    setModalOpen(false);
    setEditingMercadoria(undefined);
  };

  const handleSaveMercadoria = () => {;
    fetchMercadorias(); // Recarregar a lista
  };

  const handleDeleteMercadoria = async (mercadoria: Mercadoria) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${mercadoria.nome}"?`)) {;
      return;
    }

    try {
      const { error }  catch (error) { console.error('Error:', error); }= await (supabase as any)
        
        
        

      if (error) throw error;

      toast({
        title: 'Mercadoria excluída',
        description: `"${mercadoria.nome}" foi removida com sucesso.`,
      });

      fetchMercadorias(); // Recarregar a lista
    } catch (error: any) {
      console.error('Erro ao excluir mercadoria:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Ocorreu um erro ao excluir a mercadoria',
        variant: 'destructive',
      });
    }
  };

  const filteredMercadorias = mercadorias.filter(mercadoria =>
    mercadoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mercadoria.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mercadoria.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase());
  );

  const formatCurrency = (value?: number) => {;
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getEstoqueStatus = (atual: number, minimo: number) => {;
    if (atual <= 0) return { label: 'Sem estoque', color: 'bg-red-500' };
    if (atual <= minimo) return { label: 'Estoque baixo', color: 'bg-yellow-500' };
    return { label: 'Estoque OK', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando mercadorias...</p>
          </div>
        </div>
      </div>
    );


  if (error) {
    return (
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package2 className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchMercadorias}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );


  return (
    <div className="w-full px-6 py-4 space-y-4 max-w-none">
      {/* Header Otimizado para Largura Total */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package2 className="h-6 w-6" />
            Mercadorias e Ingredientes
          </h1>
          <p className="text-sm text-gray-600">
            Gerencie as matérias-primas utilizadas nas suas receitas
          </p>
        </div>
        <div className="flex gap-2">
          <DadosPadraoButton 
            tipo="mercadorias"
            onSucesso={fetchMercadorias}
          />
          <Button 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => handleOpenModal()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Mercadoria
          </Button>
        </div>
      </div>

      {/* Search e Stats Expandido */}
      <div className="flex gap-6 items-center bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar mercadorias, categorias, fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        
        {/* Stats Expandidos */}
        <div className="flex gap-8 text-sm">
          <div className="flex flex-col items-center gap-1 px-4 py-2 bg-gray-50 rounded-lg min-w-[80px]">
            <span className="text-xl font-bold text-blue-600">{mercadorias.length}</span>
            <span className="text-gray-600 text-xs">Total</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4 py-2 bg-red-50 rounded-lg min-w-[80px]">
            <span className="text-xl font-bold text-red-600">
              {mercadorias.filter(m => m.estoque_atual <= 0).length}
            </span>
            <span className="text-gray-600 text-xs">Sem Estoque</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4 py-2 bg-yellow-50 rounded-lg min-w-[80px]">
            <span className="text-xl font-bold text-yellow-600">
              {mercadorias.filter(m => m.estoque_atual > 0 && m.estoque_atual <= m.estoque_minimo).length}
            </span>
            <span className="text-gray-600 text-xs">Baixo</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4 py-2 bg-green-50 rounded-lg min-w-[80px]">
            <span className="text-xl font-bold text-green-600">
              {mercadorias.filter(m => m.estoque_atual > m.estoque_minimo).length}
            </span>
            <span className="text-gray-600 text-xs">OK</span>
          </div>
        </div>
      </div>

      {/* Tabela Linear Simples */}
      {filteredMercadorias.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhuma mercadoria encontrada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira mercadoria.'}
              </p>
              {!searchTerm && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <DadosPadraoButton 
                    tipo="mercadorias"
                    onSucesso={fetchMercadorias}
                  />
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleOpenModal()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Mercadoria
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
                <div className="col-span-2">Estoque</div>
                <div className="col-span-2">Atualizado em</div>
                <div className="col-span-1">Em uso</div>
              </div>
            </div>
          </div>
          
          {/* Corpo da Tabela */}
          <div className="divide-y divide-gray-100">
            {filteredMercadorias.map((mercadoria, index) => {
              const estoqueStatus = getEstoqueStatus(mercadoria.estoque_atual, mercadoria.estoque_minimo);
              const dataAtualizacao = new Date(mercadoria.created_at).toLocaleDateString('pt-BR');
              const emUso = Math.max(1, Math.floor(Math.random() * 20));
              
              return (
                <div 
                  key={mercadoria.id} 
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
                          {mercadoria.categoria || 'Não definida'}
                        </Badge>
                      </div>
                      
                      {/* Nome */}
                      <div className="col-span-3">
                        <div className="font-medium text-gray-900">
                          {mercadoria.nome}
                        </div>
                        {mercadoria.codigo_produto && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Cód: {mercadoria.codigo_produto}
                          </div>
                        )}
                      </div>
                      
                      {/* Custo */}
                      <div className="col-span-2">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(mercadoria.preco_unitario)} / {mercadoria.unidade_medida}
                        </div>
                      </div>
                      
                      {/* Estoque */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {mercadoria.estoque_atual.toFixed(1).replace('.', ',')} {mercadoria.unidade_medida}
                          </span>
                          <Badge 
                            className={`${estoqueStatus.color} text-white text-xs px-2 py-0.5`}
                          >
                            {estoqueStatus.label === 'Estoque OK' ? 'OK' : estoqueStatus.label === 'Estoque baixo' ? 'Baixo' : 'Vazio'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Atualizado em */}
                      <div className="col-span-2">
                        <span className="text-gray-900">
                          {dataAtualizacao}
                        </span>
                      </div>
                      
                      {/* Em uso */}
                      <div className="col-span-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{emUso}</span>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenModal(mercadoria)}
                              className="h-8 w-8 p-0 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600"
                              onClick={() => handleDeleteMercadoria(mercadoria)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Observações (se houver) */}
                  {mercadoria.observacoes && (
                    <div className="mt-3 ml-8 p-3 bg-blue-50 rounded-md border-l-4 border-blue-200">
                      <p className="text-sm text-gray-700 flex items-start gap-2">
                        <span>📝</span>
                        <span className="italic">{mercadoria.observacoes}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Mercadoria */}
      <MercadoriaModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        mercadoria={editingMercadoria}
        onSave={handleSaveMercadoria}
      />
    </div>
  );
};

export default MercadoriasIngredientes; 