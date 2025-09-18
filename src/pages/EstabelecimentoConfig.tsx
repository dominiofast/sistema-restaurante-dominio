
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GoogleMapRaio, { GoogleMapRaioProps } from '../components/GoogleMapRaio';
import EnderecoStep from '../components/EnderecoStep';
import { HorarioStepNovo } from '../components/HorarioStepNovo';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Truck, 
  Package, 
  DollarSign, 
  Users, 
  CreditCard, 
  Wallet, 
  Settings,
  Save,
  Instagram,
  Phone,
  FileText,
  AlertCircle, 
  X, 
  Pencil, 
  Trash2, 
  PlusCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegioesAtendimento, RegiaoAtendimento } from '../hooks/useRegioesAtendimento';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getEstados, getCidadesPorEstado } from '@/services/locationService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormasEntregaConfig } from '../components/settings/FormasEntregaConfig';
import { PagamentoEntregaConfig } from '../components/settings/PagamentoEntregaConfig';
import { AsaasConfig } from '../components/settings/AsaasConfig';
import { usePagamentoEntregaConfig } from '../hooks/usePagamentoEntregaConfig';
import { useCompanyAddress } from '../hooks/useCompanyAddress';

const EstabelecimentoConfig = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Estado para controlar se já inicializou (evita flash de carregamento)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const [activeSection, setActiveSection] = useState(() => {
    // Primeiro, verificar URL params, depois localStorage, senão usar 'informacoes'
    const urlSection = searchParams.get('section')
    const savedSection = localStorage.getItem('estabelecimento-active-section')
    return urlSection || savedSection || 'informacoes';
  })
  
  const { currentCompany } = useAuth()
  
  // Mover todos os hooks para o nível superior do componente
  const { companyInfo, loading, error, saveCompanyInfo } = useCompanyInfo()
  const [formData, setFormData] = useState({
    cnpj_cpf: '',
    razao_social: '',
    nome_estabelecimento: '',
    segmento: '',
    instagram: '',
    contato: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Hooks para Regiões de Atendimento - apenas se necessário
  const shouldLoadRegioes = activeSection === 'regioes-atendimento';
  const { regioes, loading: regioesLoading, error: regioesError, adicionarRegiao, atualizarRegiao, toggleStatus, excluirRegiao, atualizarCentroRegioes } = useRegioesAtendimento(shouldLoadRegioes ? currentCompany?.id : undefined)
  const [tab, setTab] = useState<'bairros'|'raio'>('raio')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [regiaoEmEdicao, setRegiaoEmEdicao] = useState<Partial<RegiaoAtendimento> | null>(null)
  const [estados, setEstados] = useState<{ sigla: string, nome: string }[]>([])
  const [cidades, setCidades] = useState<{ nome: string, codigo_ibge: string }[]>([])
  const [selectedEstado, setSelectedEstado] = useState('')
  const [selectedCidade, setSelectedCidade] = useState('')
  const [loadingCidades, setLoadingCidades] = useState(false)
  
  // Hooks para Pagamento na Entrega - apenas se necessário
  const shouldLoadPagamento = activeSection === 'pagamento-entrega';
  const { config: pagamentoConfig, loading: pagamentoLoading, error: pagamentoError, saveConfig, setConfig } = usePagamentoEntregaConfig(shouldLoadPagamento ? currentCompany?.id : undefined)
  const [saving, setSaving] = useState(false)
  
  // Hook para Endereço do Estabelecimento
  const { address: companyAddress } = useCompanyAddress()

  const menuItems = [
    { id: 'informacoes', label: 'Informações', icon: Building2 },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'horarios', label: 'Horários', icon: Clock },
    { id: 'prazo-entrega', label: 'Prazo de entrega', icon: Truck },
    { id: 'formas-entrega', label: 'Formas de entrega', icon: Package },
    { id: 'taxa-minima', label: 'Taxa mínima', icon: DollarSign },
    { id: 'regioes-atendimento', label: 'Regiões de atendimento', icon: Users },
    { id: 'pagamento-online', label: 'Pagamento online', icon: CreditCard },
    { id: 'pagamento-entrega', label: 'Pagamento na entrega', icon: Wallet },
    { id: 'operacao-salao', label: 'Operação no salão', icon: Settings };
  ];
  
  // useEffect para atualizar formData quando companyInfo mudar
  useEffect(() => {
    if (companyInfo) {
      setFormData({
        cnpj_cpf: companyInfo.cnpj_cpf || '',
        razao_social: companyInfo.razao_social || '',
        nome_estabelecimento: companyInfo.nome_estabelecimento || '',
        segmento: companyInfo.segmento || '',
        instagram: companyInfo.instagram || '',
        contato: companyInfo.contato || '',
      })
    }
  }, [companyInfo])
  
  // useEffects para Regiões de Atendimento
  useEffect(() => {
    // useEffect para inicialização única
    setIsInitialized(true)
  }, [])

  // useEffects para Regiões de Atendimento - apenas quando necessário
  useEffect(() => {
    if (!shouldLoadRegioes) return;
    
    const fetchEstados = async () => {
      try {
        const data = await getEstados()
        setEstados(data)
      } catch (error) {
        console.error(error)
      }
    };
    fetchEstados()
  }, [shouldLoadRegioes])

  // useEffect para persistir seção ativa na URL e localStorage - otimizado
  useEffect(() => {
    if (!isInitialized) return; // Evita execução no primeiro render
    
    // Salvar no localStorage apenas se mudou
    const savedSection = localStorage.getItem('estabelecimento-active-section')
    if (savedSection !== activeSection) {
      localStorage.setItem('estabelecimento-active-section', activeSection)
    }
    
    // Atualizar URL apenas se mudou
    const currentUrlSection = searchParams.get('section')
    if (currentUrlSection !== activeSection) {
      setSearchParams({ section: activeSection }, { replace: true })
    }
  }, [activeSection, setSearchParams, isInitialized, searchParams])

  // useEffect para sincronizar com mudanças na URL (botão voltar/avançar do navegador)
  useEffect(() => {
    const urlSection = searchParams.get('section')
    if (urlSection && urlSection !== activeSection) {
      setActiveSection(urlSection)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchCidades = async () => {
      if (selectedEstado) {
        setLoadingCidades(true)
        setSelectedCidade('')
        setCidades([])
        try {
          const data = await getCidadesPorEstado(selectedEstado)
          setCidades(data)
        } catch (error) {
          console.error(error)
        } finally {
          setLoadingCidades(false)
        }
      }
    };
    fetchCidades()
  }, [selectedEstado])

  // Corrigir coordenadas das regiões de raio quando o endereço do estabelecimento estiver disponível
  useEffect(() => {
    if (companyAddress?.latitude && companyAddress?.longitude && regioes.length > 0) {
      const regioesRaioComCoordenadaIncorreta = regioes.filter(r => 
        r.tipo === 'raio' && 
        r.centro_lat !== companyAddress.latitude && 
        r.centro_lng !== companyAddress.longitude;
      )
      
      if (regioesRaioComCoordenadaIncorreta.length > 0) {
        console.log('🔧 Corrigindo coordenadas de', regioesRaioComCoordenadaIncorreta.length, 'regiões de raio')
        atualizarCentroRegioes({ lat: companyAddress.latitude, lng: companyAddress.longitude })
      }
    }
  }, [companyAddress, regioes])

  // Componente para Informações básicas
  const renderInformacoes = () => {

    const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value;
      }))
    };

    const handleSave = async () => {
      setIsSaving(true)
      setSaveSuccess(false)
      
      const success = await saveCompanyInfo(formData)
      
      if (success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
      
      setIsSaving(false)
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando informações...</span>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Informações do Estabelecimento</h1>
          <p className="text-gray-600">Configure as informações principais do seu estabelecimento</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600">Informações salvas com sucesso!</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Nome do estabelecimento */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do estabelecimento *
              </label>
              <input
                type="text"
                value={formData.nome_estabelecimento}
                onChange={(e) => handleInputChange('nome_estabelecimento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Digite o nome do estabelecimento"
              />
            </div>

            {/* Segmento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segmento
              </label>
              <select
                value={formData.segmento}
                onChange={(e) => handleInputChange('segmento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              >
                <option value="">Selecione o segmento</option>
                <option value="pizzaria">Pizzaria</option>
                <option value="restaurante">Restaurante</option>
                <option value="lanchonete">Lanchonete</option>
                <option value="padaria">Padaria</option>
                <option value="sorveteria">Sorveteria</option>
                <option value="hamburgueria">Hamburgueria</option>
                <option value="cafeteria">Cafeteria</option>
                <option value="acai">Açaí</option>
                <option value="japones">Japonês</option>
                <option value="italiano">Italiano</option>
                <option value="arabe">Árabe</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {/* CNPJ/CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ/CPF
              </label>
              <input
                type="text"
                value={formData.cnpj_cpf}
                onChange={(e) => handleInputChange('cnpj_cpf', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Digite o CNPJ ou CPF"
              />
            </div>

            {/* Razão Social */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social
              </label>
              <input
                type="text"
                value={formData.razao_social}
                onChange={(e) => handleInputChange('razao_social', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Digite a razão social"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <div className="relative">
                <Instagram className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="@seuinstagram"
                />
              </div>
            </div>

            {/* Contato/Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contato/Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.contato}
                  onChange={(e) => handleInputChange('contato', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving || !formData.nome_estabelecimento.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Informações'}
            </button>
          </div>
        </div>
      </div>
    )
  };

  const renderEndereco = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Endereço</h1>
          <p className="text-gray-600">Configure o endereço do seu estabelecimento</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <EnderecoStep />
        </div>
      </div>;
    )
  };

  const renderHorarios = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Horários de Funcionamento</h1>
          <p className="text-gray-600">Configure os horários de funcionamento do seu estabelecimento</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <HorarioStepNovo />
        </div>
      </div>;
    )
  };

  const renderPrazoEntrega = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prazo de Entrega</h1>
          <p className="text-gray-600">Configure os prazos de entrega do seu estabelecimento</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempo mínimo (minutos)</label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempo máximo (minutos)</label>
              <input
                type="number"
                defaultValue="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="60"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm">
              <Save className="w-4 h-4" />
              Salvar Prazo
            </button>
          </div>
        </div>
      </div>;
    )
  };

  const renderFormasEntrega = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Formas de Entrega</h1>
          <p className="text-gray-600">Configure as formas de entrega disponíveis</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormasEntregaConfig />
        </div>
      </div>;
    )
  };

  const renderTaxaMinima = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Taxa Mínima</h1>
          <p className="text-gray-600">Defina o valor mínimo para pedidos e taxas de entrega</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Esta funcionalidade será implementada em breve.</p>
          </div>
        </div>
      </div>;
    )
  };

  const renderRegioesAtendimento = () => {
    // Usar coordenadas do endereço do estabelecimento ou coordenadas padrão de Cacoal, RO
    const center = companyAddress?.latitude && companyAddress?.longitude 
      ? { lat: companyAddress.latitude, lng: companyAddress.longitude };
      : { lat: -11.4387, lng: -61.4472 };


    const handleOpenModal = (regiao: Partial<RegiaoAtendimento> | null = null) => {
      setRegiaoEmEdicao(regiao)
      setIsModalOpen(true)
    }

    const handleCloseModal = () => {
      setIsModalOpen(false)
      setRegiaoEmEdicao(null)
    }

    const handleSaveRegiao = async () => {
      if (!regiaoEmEdicao) return;

      const isBairro = regiaoEmEdicao.tipo === 'bairro';

      if (isBairro && (!regiaoEmEdicao.bairro || regiaoEmEdicao.bairro.trim() === '' || regiaoEmEdicao.valor === undefined)) {
        alert("Nome do Bairro e Valor da Taxa são obrigatórios.")
        return;
      }

      if (!isBairro && (regiaoEmEdicao.raio_km === undefined || regiaoEmEdicao.valor === undefined)) {
        alert("Raio (Km) e Valor da Taxa são obrigatórios.")
        return;
      }

      try {
        if (regiaoEmEdicao.id) {
          // ATUALIZAR
          const updates: Partial<RegiaoAtendimento> = { valor: Number(regiaoEmEdicao.valor) } catch (error) { console.error('Error:', error) };
          if (isBairro) {
            updates.bairro = regiaoEmEdicao.bairro;
            updates.cidade = regiaoEmEdicao.cidade;
          } else {
            updates.raio_km = Number(regiaoEmEdicao.raio_km)
          }
          await atualizarRegiao(regiaoEmEdicao.id, updates)
        } else {
          // ADICIONAR
          const novaRegiao: Omit<RegiaoAtendimento, 'id' | 'created_at'> = {
            company_id: currentCompany?.id || '',
            tipo: regiaoEmEdicao.tipo!,
            valor: Number(regiaoEmEdicao.valor),
            status: true,
            ...(isBairro ? {
              bairro: regiaoEmEdicao.bairro,
              cidade: selectedCidade
            } : {
              centro_lat: center.lat,
              centro_lng: center.lng,
              raio_km: Number(regiaoEmEdicao.raio_km),
            })
          };
          await adicionarRegiao(novaRegiao)
        }
        handleCloseModal()
      } catch (err) {
        console.error("Erro ao salvar região", err)
      }
    };

    const handleToggleStatus = async (id: string) => {
      try {
        await toggleStatus(id)
      } catch (err) {
        console.error('Erro ao alterar status:', err)
      }
    };

    const handleExcluirRegiao = async (id: string) => {
      if (window.confirm("Tem certeza que deseja excluir esta região?")) {
        try {
          await excluirRegiao(id)
        } catch (err) {
          console.error('Erro ao excluir região:', err)
        }
      }
    };

    if (regioesLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando regiões...</span>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Regiões de Atendimento</h1>
          <p className="text-gray-600">Adicione pelo menos uma região de atendimento do seu estabelecimento</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {regioesError && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-600">{regioesError}</p>
            </div>
          )}
          
          <div className="flex gap-2 mb-4">
            <button className={`px-4 py-2 rounded-l font-semibold transition-all ${tab==='bairros'?'bg-blue-600 text-white':'bg-slate-100 text-slate-600'}`} onClick={()=>setTab('bairros')}>Bairro</button>
            <button className={`px-4 py-2 rounded-r font-semibold transition-all ${tab==='raio'?'bg-blue-600 text-white':'bg-slate-100 text-slate-600'}`} onClick={()=>setTab('raio')}>Raio</button>
          </div>

          {tab === 'bairros' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-md bg-slate-50">
                <div>
                  <Label>Estado (UF)</Label>
                  <Select onValueChange={setSelectedEstado} value={selectedEstado}>
                    <SelectTrigger><SelectValue placeholder="Selecione um estado" /></SelectTrigger>
                    <SelectContent>
                      {estados.map(estado => <SelectItem key={estado.sigla} value={estado.sigla}>{estado.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Select onValueChange={setSelectedCidade} value={selectedCidade} disabled={!selectedEstado || loadingCidades}>
                    <SelectTrigger><SelectValue placeholder={loadingCidades ? "Carregando..." : "Selecione uma cidade"} /></SelectTrigger>
                    <SelectContent>
                      {cidades.map(cidade => <SelectItem key={cidade.codigo_ibge} value={cidade.nome}>{cidade.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="self-end">
                  <Button onClick={() => handleOpenModal({ tipo: 'bairro', cidade: selectedCidade, valor: 0, status: true })} disabled={!selectedCidade}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Bairro
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="mb-2 font-semibold text-slate-700">Total de {regioes.filter(r => r.tipo === 'bairro').length} bairros</div>
                <table className="min-w-full bg-white text-sm">
                  <thead>
                    <tr className="bg-slate-50"><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Bairro</th><th className="px-4 py-2 text-left">Cidade</th><th className="px-4 py-2 text-left">Valor da Taxa</th><th className="px-4 py-2 text-right">Ações</th></tr>
                  </thead>
                  <tbody>
                    {regioes.filter(r => r.tipo === 'bairro').map(reg => (
                      <tr key={reg.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2"><button onClick={()=>handleToggleStatus(reg.id)} className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${reg.status ? 'bg-green-500 border-green-600' : 'bg-slate-200 border-slate-300 hover:bg-slate-300'}`}>{reg.status && <span className="text-white font-bold text-xs">✓</span>}</button></td>
                        <td className="px-4 py-2">{reg.bairro}</td>
                        <td className="px-4 py-2">{reg.cidade}</td>
                        <td className="px-4 py-2">R$ {reg.valor?.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(reg)} className="mr-2"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={()=>handleExcluirRegiao(reg.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                    {regioes.filter(r => r.tipo === 'bairro').length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhum bairro cadastrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {tab === 'raio' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Atendimento por Raio</h3>
                  <Button onClick={() => handleOpenModal({tipo: 'raio', raio_km: 0, valor: 0})}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Raio
                  </Button>
              </div>

              <div className="mb-4 mt-4">
                <GoogleMapRaio center={center} regioes={regioes.filter(r => r.tipo === 'raio')} />
              </div>
              <div className="mb-2 font-semibold text-slate-700">Total de {regioes.filter(r => r.tipo === 'raio').length} registros</div>
              
                <table className="min-w-full bg-white text-sm">
                  <thead>
                    <tr className="bg-slate-50"><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Raio (Km)</th><th className="px-4 py-2 text-left">Valor da Taxa</th><th className="px-4 py-2 text-right">Ações</th></tr>
                  </thead>
                  <tbody>
                    {regioes.filter(r => r.tipo === 'raio').map(reg=>(
                      <tr key={reg.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2"><button onClick={()=>handleToggleStatus(reg.id)} className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${reg.status ? 'bg-green-500 border-green-600' : 'bg-slate-200 border-slate-300 hover:bg-slate-300'}`}>{reg.status && <span className="text-white font-bold text-xs">✓</span>}</button></td>
                        <td className="px-4 py-2">{reg.raio_km}</td>
                        <td className="px-4 py-2">R$ {reg.valor?.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(reg)} className="mr-2"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={()=>handleExcluirRegiao(reg.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                    {regioes.filter(r => r.tipo === 'raio').length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Nenhum raio de atendimento cadastrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white" onEscapeKeyDown={handleCloseModal}>
            <DialogHeader>
              <DialogTitle className="text-gray-900">{regiaoEmEdicao?.tipo === 'bairro' ? (regiaoEmEdicao?.id ? 'Editar Bairro' : 'Adicionar Novo Bairro') : (regiaoEmEdicao?.id ? 'Editar Raio' : 'Adicionar Novo Raio')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {regiaoEmEdicao?.tipo === 'bairro' ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cidade" className="text-right text-gray-700">Cidade</Label>
                    <Input id="cidade" value={regiaoEmEdicao.cidade || ''} disabled className="col-span-3 bg-gray-50" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bairro" className="text-right text-gray-700">Bairro</Label>
                    <Input id="bairro" value={regiaoEmEdicao.bairro || ''} onChange={(e) => setRegiaoEmEdicao({...regiaoEmEdicao, bairro: e.target.value})} className="col-span-3" />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="raio_km" className="text-right text-gray-700">Raio (Km)</Label>
                  <Input id="raio_km" type="number" value={regiaoEmEdicao?.raio_km || ''} onChange={(e) => setRegiaoEmEdicao({...regiaoEmEdicao, raio_km: parseFloat(e.target.value)})} className="col-span-3"/>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="valor" className="text-right text-gray-700">Valor da Taxa</Label>
                <Input id="valor" type="number" value={regiaoEmEdicao?.valor || ''} onChange={(e) => setRegiaoEmEdicao({...regiaoEmEdicao, valor: parseFloat(e.target.value)})} className="col-span-3" placeholder="R$"/>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
              <Button onClick={handleSaveRegiao}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  };

  const renderPagamentoOnline = () => {
    if (!currentCompany?.id) {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento Online</h1>
            <p className="text-gray-600">Configure as formas de pagamento online aceitas pelo estabelecimento</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Carregando configurações...</p>
            </div>
          </div>
        </div>;
      )
    }

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento Online</h1>
          <p className="text-gray-600">Configure as formas de pagamento online aceitas pelo estabelecimento</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AsaasConfig companyId={currentCompany.id} />
        </div>
      </div>
    )
  };

  const renderPagamentoEntrega = () => {

    if (pagamentoLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando configurações...</span>
        </div>;
      )
    }

    if (pagamentoError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">{pagamentoError}</p>
        </div>
      )
    }

    const handleConfigChange = (newConfig: typeof pagamentoConfig) => {
      setConfig(newConfig)
    };

    const handleSaveConfig = async (newConfig: typeof pagamentoConfig) => {
      setSaving(true)
      try {
        const success = await saveConfig(newConfig)
        return success;
      } finally {
        setSaving(false)
      }
    };

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento na Entrega</h1>
          <p className="text-gray-600">Configure as formas de pagamento aceitas na entrega</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <PagamentoEntregaConfig 
            config={pagamentoConfig} 
            onChange={handleConfigChange}
            onSave={handleSaveConfig}
            saving={saving}
          />
        </div>
      </div>
    )
  };

  const renderOperacaoSalao = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Operação no Salão</h1>
          <p className="text-gray-600">Configure as opções de atendimento no salão do estabelecimento</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Esta funcionalidade será implementada em breve.</p>
          </div>
        </div>
      </div>;
    )
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'informacoes':;
        return renderInformacoes()
      case 'endereco':
        return renderEndereco()
      case 'horarios':
        return renderHorarios()
      case 'prazo-entrega':
        return renderPrazoEntrega()
      case 'formas-entrega':
        return renderFormasEntrega()
      case 'taxa-minima':
        return renderTaxaMinima()
      case 'regioes-atendimento':
        return renderRegioesAtendimento()
      case 'pagamento-online':
        return renderPagamentoOnline()
      case 'pagamento-entrega':
        return renderPagamentoEntrega()
      case 'operacao-salao':
        return renderOperacaoSalao()
      default:
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Em Desenvolvimento</h1>
              <p className="text-gray-600">Esta seção está sendo desenvolvida</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Conteúdo em desenvolvimento...</p>
              </div>
            </div>
          </div>
        )
    }
  };

  // Se ainda não inicializou, mostra um placeholder mínimo para evitar flash
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Configurações</h2>
            <p className="text-sm text-gray-600 mt-1">Estabelecimento</p>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Configurações</h2>
          <p className="text-sm text-gray-600 mt-1">Estabelecimento</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-sm text-gray-400 font-medium">{index + 1}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="w-full max-w-none">
          {renderContent()}
        </div>
      </div>
    </div>
  )
};

export default EstabelecimentoConfig;
