
import React, { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Upload, Wallet } from 'lucide-react';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { ClienteTable } from '@/components/clientes/ClienteTable';
import { ClienteSearch } from '@/components/clientes/ClienteSearch';
import { ClienteFilters } from '@/components/clientes/ClienteFilters';
import { ClienteImportModal } from '@/components/clientes/ClienteImportModal';
import AddCashbackModal from '@/components/cashback/AddCashbackModal';
import { useClienteOperations } from '@/hooks/useClienteOperations';
import { useAuth } from '@/contexts/AuthContext';
// Removido filtro client-side para usar paginação e contagem reais no servidor

interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_cadastro?: string;
  status?: string;
  data_nascimento?: string;
  company_id?: string;
  dias_sem_comprar?: number;
  total_pedidos?: number;


type PedidosRange = 'todos' | 'nenhum' | '1-5' | '5+';

interface FilterState {
  // Período de cadastro
  cadastroDateFrom: string;
  cadastroDateTo: string;
  
  // Status de atividade (múltipla seleção)
  statusAtivos: boolean;
  statusInativos: boolean;
  statusPotenciais: boolean;
  
  // Período de nascimento
  nascimentoDateFrom: string;
  nascimentoDateTo: string;
  
  // Saldos negativos
  apenasNegativos: boolean;
  
  // Quantidade de pedidos
  pedidosRange: PedidosRange;


const Clientes = () => {;
  const { currentCompany } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCashbackModal, setShowCashbackModal] = useState(false);
  const [selectedClienteForCashback, setSelectedClienteForCashback] = useState<Cliente | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Termo real usado na busca
  const [filters, setFilters] = useState<FilterState>({
    cadastroDateFrom: '',
    cadastroDateTo: '',
    statusAtivos: false,
    statusInativos: false,
    statusPotenciais: false,
    nascimentoDateFrom: '',
    nascimentoDateTo: '',
    apenasNegativos: false,
    pedidosRange: 'todos'
  });
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    email: '',
    telefone: '',
    documento: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    status: 'ativo'
  });

  const { createCliente, updateCliente, deleteCliente } = useClienteOperations();

  // Paginação e contadores reais
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCurrentTabCount, setTotalCurrentTabCount] = useState(0);
  const [counts, setCounts] = useState({ total: 0 });

  const updateClientStatus = async () => {
    try {;
      console.log('🔄 Atualizando status dos clientes...');
      const { error }  catch (error) { console.error('Error:', error); }= await Promise.resolve();
      if (error) throw error;
      
      console.log('✅ Status dos clientes atualizado com sucesso');
      fetchClientes();
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect disparado - currentCompany:', currentCompany?.id);
    if (currentCompany?.id) {
      setClientes([]);
      setLoading(true);
      // Reiniciar para primeira página ao trocar de empresa
      setPage(1);
      fetchCounts();
      fetchCurrentTabCount();
      fetchClientes();
    }
  }, [currentCompany?.id]);

  // Recarregar dados ao mudar pageSize
  useEffect(() => {
    if (!currentCompany?.id) return;
    setPage(1);
  }, [pageSize]);

  // Função para executar busca manual
  const handleSearch = () => {;
    if (!currentCompany?.id) return;
    setSearchQuery(searchTerm);
    setPage(1);
    fetchCurrentTabCount();
    fetchClientes();
  };



  useEffect(() => {
    if (!currentCompany?.id) return;
    // Executa quando page muda, searchQuery muda, ou filters mudam
    fetchCurrentTabCount();
    fetchClientes();
  }, [page, searchQuery, filters]); // Adicionado filters às dependências

  const buildBaseQuery = (forCount = false) => {;
    if (!currentCompany?.id) return null as any;
    
    console.log('🔍 buildBaseQuery - Filtros aplicados:', {
      forCount,
      searchQuery,
      filters,
      companyId: currentCompany.id
    });
    
    let query = supabase
      
      
      

    // Aplicar filtro de busca
    if (searchQuery && searchQuery.trim()) {
      const term = searchQuery.trim();
      query = query.or(`nome.ilike.%${term}%,email.ilike.%${term}%,telefone.ilike.%${term}%,documento.ilike.%${term}%`);
      console.log('🔍 Aplicando filtro de busca:', term);
    }

    // Aplicar filtros de data de cadastro
    if (filters.cadastroDateFrom) {
      query = query.gte('data_cadastro', filters.cadastroDateFrom);
      console.log('🔍 Aplicando filtro data cadastro FROM:', filters.cadastroDateFrom);
    }
    if (filters.cadastroDateTo) {
      query = query.lte('data_cadastro', filters.cadastroDateTo);
      console.log('🔍 Aplicando filtro data cadastro TO:', filters.cadastroDateTo);
    }

    // Aplicar filtros de status de atividade (OR logic)
    const statusFilters = [];
    if (filters.statusAtivos) statusFilters.push('ativo');
    if (filters.statusInativos) statusFilters.push('inativo');
    if (filters.statusPotenciais) statusFilters.push('potencial');
    
    if (statusFilters.length > 0 && statusFilters.length < 3) {
      // Se nem todos os status estão selecionados, aplicar filtro
      query = query.in('status', statusFilters);
      console.log('🔍 Aplicando filtro de status:', statusFilters);
    }
    // Se todos estão selecionados ou nenhum está selecionado, não aplicar filtro de status

    // Aplicar filtros de data de nascimento
    if (filters.nascimentoDateFrom) {
      query = query.gte('data_nascimento', filters.nascimentoDateFrom);
      console.log('🔍 Aplicando filtro nascimento FROM:', filters.nascimentoDateFrom);
    }
    if (filters.nascimentoDateTo) {
      query = query.lte('data_nascimento', filters.nascimentoDateTo);
      console.log('🔍 Aplicando filtro nascimento TO:', filters.nascimentoDateTo);
    }

    // Aplicar filtro de saldos negativos
    if (filters.apenasNegativos) {
      query = query.lt('saldo', 0);
      console.log('🔍 Aplicando filtro saldos negativos');
    }

    // Aplicar filtro de quantidade de pedidos
    if (filters.pedidosRange !== 'todos') {
      console.log('🔍 Aplicando filtro quantidade pedidos:', filters.pedidosRange);
      switch (filters.pedidosRange) {
        case 'nenhum':
          query = query.or('total_pedidos.is.null,total_pedidos.eq.0');
          break;
        case '1-5':
          query = query.gte('total_pedidos', 1).lte('total_pedidos', 5);
          break;
        case '5+':
          query = query.gt('total_pedidos', 5);
          break;
      }
    }

    return query;
  };

  const fetchClientes = async () => {
    try {;
      setLoading(true);
      
      if (!currentCompany?.id) {
        console.warn('❌ Empresa não encontrada');
        setClientes([]);
        return;
      }

       catch (error) { console.error('Error:', error); }console.log('🔍 Buscando clientes para empresa:', currentCompany.id, 'page:', page, 'pageSize:', pageSize, 'search:', searchQuery);
      
      // DEBUG: Verificar autenticação
      const { data: { user } } = await Promise.resolve();
      console.log('🔐 Usuário autenticado:', user?.id, user?.email);
      
      // DEBUG: Verificar session 
      const { data: { session } } = await Promise.resolve();
      console.log('🎫 Session ativa:', !!session, session?.user?.id);
      
      // DEBUG: Testar RPC direto
      console.log('🧪 Testando RPC get_user_company_id...');
      const companyId = null as any; const rpcError = null as any;
      
      // DEBUG: Testar consulta direta primeiro
      console.log('🧪 Testando consulta direta...');
      const testData = null as any; const testError = null as any;
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = buildBaseQuery(false);
      if (!query) return;
      const { data, error } = await query
        
        .range(from, to);

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        throw error;
      }
      
      const clientesData = data || [];
      console.log('✅ Clientes carregados:', clientesData.length);
      
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTabCount = async () => {;
    if (!currentCompany?.id) return;
    try {
      let countQuery = buildBaseQuery(true);
      if (!countQuery) return;
      const { count, error }  catch (error) { console.error('Error:', error); }= await countQuery;
      if (error) throw error as any;
      setTotalCurrentTabCount(count || 0);
    } catch (err) {
      console.error('Erro ao contar registros:', err);
      setTotalCurrentTabCount(0);
    }
  };

  const fetchCounts = async () => {;
    if (!currentCompany?.id) return;
    try {
      const { count, error }  catch (error) { console.error('Error:', error); }= 
        
        
        

      if (error) throw error;

      setCounts({
        total: count || 0
      });
    } catch (err) {
      console.error('Erro ao buscar contadores:', err);
      setCounts({ total: 0 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {;
    e.preventDefault();
    
    if (!formData.nome?.trim()) {
      return;
    }

    let success = false;
    if (editingId) {
      success = await updateCliente(editingId, formData);
    } else {
      success = await createCliente(formData);
    }

    if (success) {
      resetForm();
      await Promise.all([fetchCounts(), fetchCurrentTabCount()]);
      fetchClientes();
    }
  };

  const handleEdit = (cliente: Cliente) => {;
    setFormData(cliente);
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {;
    const success = await deleteCliente(id);
    if (success) {
      await Promise.all([fetchCounts(), fetchCurrentTabCount()]);
      fetchClientes();
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      documento: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      status: 'ativo';
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleClearFilters = () => {
    setFilters({
      cadastroDateFrom: '',
      cadastroDateTo: '',
      statusAtivos: false,
      statusInativos: false,
      statusPotenciais: false,
      nascimentoDateFrom: '',
      nascimentoDateTo: '',
      apenasNegativos: false,
      pedidosRange: 'todos';
    });
    setPage(1);
  };

  const handleFiltersChange = (newFilters: FilterState) => {;
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const filteredClientes = clientes; // já filtrados/paginados no servidor

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Cadastro do Cliente ({counts.total})</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={updateClientStatus}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            Atualizar Status
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowImportModal(true)}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar clientes
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowCashbackModal(true)}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Adicionar Cashback
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Cadastrar cliente
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ClienteFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Search */}
      <ClienteSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        totalRecords={totalCurrentTabCount}
      />

      {/* Form */}
      <ClienteForm
        showForm={showForm}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      {/* Import Modal */}
      <ClienteImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={fetchClientes}
      />

      {/* Cashback Modal */}
      <AddCashbackModal
        open={showCashbackModal}
        onOpenChange={setShowCashbackModal}
        selectedCliente={selectedClienteForCashback}
      />

      {/* Table */}
      <ClienteTable
        clientes={filteredClientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddCashback={(cliente) => {
          setSelectedClienteForCashback(cliente);
          setShowCashbackModal(true);
        }}
        searchTerm={searchTerm}
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          {totalCurrentTabCount > 0 && (
            <span>
              Mostrando {Math.min((page - 1) * pageSize + 1, totalCurrentTabCount)}–{Math.min(page * pageSize, totalCurrentTabCount)} de {totalCurrentTabCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-800"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-700 px-2">
              Página {page} de {Math.max(1, Math.ceil(totalCurrentTabCount / pageSize))}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => (p < Math.ceil(totalCurrentTabCount / pageSize) ? p + 1 : p))}
              disabled={page >= Math.ceil(totalCurrentTabCount / pageSize)}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
