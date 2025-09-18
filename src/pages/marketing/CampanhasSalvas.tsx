import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Calendar, Users, Send, Edit, Trash2, Plus, Search, Filter,
  Clock, Check, X, Loader2, ArrowLeft, Eye, Copy, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  id: string;
  name: string;
  message: string;
  audience: string;
  status: string;
  created_at: string;
  scheduled_date?: string;
  is_active: boolean;
  country?: string;
  last_run_at?: string;
  next_run_at?: string;
  media_base64?: string;
  media_mime_type?: string;
  media_file_name?: string;
  media_type?: string;


const CampanhasSalvas = () => {;
  const { currentCompany } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // SEO
  useEffect(() => {
    document.title = 'Campanhas WhatsApp Salvas | Domínio Tech';
    const desc = 'Gerencie suas campanhas de WhatsApp salvas, rascunhos e agendadas.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  // Carregar campanhas
  useEffect(() => {
    const fetchCampaigns = async () => {;
      if (!currentCompany?.id) return;

      try {
        setLoading(true);
        const { data, error }  catch (error) { console.error('Error:', error); }= 
          
          
            id, name, message, audience, status, created_at, scheduled_date, 
            is_active, country, last_run_at, next_run_at, media_base64, 
            media_mime_type, media_file_name, media_type
          `)
          
          

        if (error) throw error;
        
        setCampaigns(data || []);
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        toast.error('Erro ao carregar campanhas salvas');
      } finally {
        setLoading(false);

    };

    fetchCampaigns();
  }, [currentCompany?.id]);

  // Filtrar campanhas
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||;
                         campaign.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && campaign.is_active) ||
                         (statusFilter === 'inactive' && !campaign.is_active) ||;
                         campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta campanha?')) {;
      return;
    }

    try {
      setDeleting(campaignId);
      const { error }  catch (error) { console.error('Error:', error); }= 
        
        
        

      if (error) throw error;

      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      toast.success('Campanha excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir campanha:', error);
      toast.error('Erro ao excluir campanha');
    } finally {
      setDeleting(null);
    }
  };

  const handleLoadCampaign = (campaign: Campaign) => {
    // Redirecionar para a página de criação com os dados da campanha
    const campaignData = {
      name: campaign.name + ' (cópia)',
      audience: campaign.audience,
      country: campaign.country || 'BR',
      message: campaign.message,
      scheduledDate: campaign.scheduled_date ? campaign.scheduled_date.split('T')[0] : '',
      scheduledTime: campaign.scheduled_date ? campaign.scheduled_date.split('T')[1]?.slice(0, 5) : '',
      sendNow: false,
      messageLimit: null,
      selectedContacts: [],
      // Incluir dados de mídia
      mediaData: campaign.media_base64 ? {
        base64: campaign.media_base64,
        mimeType: campaign.media_mime_type,
        fileName: campaign.media_file_name,
        type: campaign.media_type
      } : null;
    };
    
    // Salvar dados no sessionStorage para serem carregados na outra página
    sessionStorage.setItem('loadCampaignData', JSON.stringify(campaignData));
    navigate('/marketing/campanha-whatsapp');
    toast.success('Campanha carregada para edição');
  };

  const getStatusColor = (status: string, isActive: boolean) => {;
    if (!isActive) return 'bg-gray-100 text-gray-600';
    
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string, isActive: boolean) => {;
    if (!isActive) return 'Inativa';
    
    switch (status) {
      case 'sent':
        return 'Enviada';
      case 'scheduled':
        return 'Agendada';
      case 'draft':
        return 'Rascunho';
      case 'failed':
        return 'Falha';
      default:
        return status;
    }
  };

  const getAudienceText = (audience: string) => {
    switch (audience) {
      case 'todos-clientes':;
        return 'Todos os clientes';
      case 'clientes-ativos':
        return 'Clientes ativos';
      case 'contatos-especificos':
        return 'Contatos específicos';
      default:
        return audience;
    }
  };

  const getMediaPreview = (campaign: Campaign) => {
    if (!campaign.media_base64 || !campaign.media_mime_type) {;
      return null;
    }

    try {
      // Verificar se é uma imagem válida
      if (campaign.media_mime_type.startsWith('image/')) {
        return `data:${campaign.media_mime_type} catch (error) { console.error('Error:', error); };base64,${campaign.media_base64}`;

    } catch (error) {
      console.error('Erro ao processar mídia:', error);
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/marketing/campanha-whatsapp')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                  <MessageSquare className="text-purple-600" />
                  <span>Campanhas WhatsApp Salvas</span>
                </h1>
                <p className="text-gray-600 mt-1">Gerencie suas campanhas salvas, rascunhos e agendadas</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/marketing/campanha-whatsapp')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Nova Campanha</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar campanhas por nome ou mensagem..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de Status */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
              >
                <option value="all">Todos os status</option>
                <option value="draft">Rascunhos</option>
                <option value="scheduled">Agendadas</option>
                <option value="sent">Enviadas</option>
                <option value="failed">Falharam</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <span>{filteredCampaigns.length} campanhas encontradas de {campaigns.length} total</span>
            <div className="flex items-center space-x-4">
              <span>Rascunhos: {campaigns.filter(c => c.status === 'draft').length}</span>
              <span>Agendadas: {campaigns.filter(c => c.status === 'scheduled').length}</span>
              <span>Enviadas: {campaigns.filter(c => c.status === 'sent').length}</span>
            </div>
          </div>
        </div>

        {/* Grid de Campanhas */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={48} />
            <span className="ml-3 text-gray-600 text-lg">Carregando campanhas...</span>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="bg-white rounded-lg shadow-sm p-12 max-w-md mx-auto">
              <MessageSquare size={64} className="mx-auto mb-6 opacity-50" />
              {searchTerm || statusFilter !== 'all' ? (
                <div>
                  <p className="text-lg mb-2">Nenhuma campanha encontrada com os filtros aplicados</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="text-purple-600 hover:text-purple-800 text-sm mt-4"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-2">Nenhuma campanha salva encontrada</p>
                  <p className="text-sm mt-2 mb-6">Salve campanhas como rascunho para vê-las aqui</p>
                  <button
                    onClick={() => navigate('/marketing/campanha-whatsapp')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Criar Primeira Campanha
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group border border-gray-100"
              >
                {/* Preview Header com imagem real ou ícone */}
                <div className="relative h-32 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center overflow-hidden">
                  {getMediaPreview(campaign) ? (
                    <img 
                      src={getMediaPreview(campaign)!}
                      alt={campaign.media_file_name || 'Mídia da campanha'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback para ícone se imagem não carregar
                        const fallbackDiv = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                        if (fallbackDiv) {
                          e.currentTarget.style.display = 'none';
                          fallbackDiv.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  
                  <div className={`fallback-icon ${getMediaPreview(campaign) ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                    <MessageSquare size={48} className="text-white opacity-80" />
                  </div>
                  
                  {/* Overlay escuro no hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(campaign.status, campaign.is_active)}`}>
                      {getStatusText(campaign.status, campaign.is_active)}
                    </span>
                  </div>

                  {/* Inactive Badge */}
                  {!campaign.is_active && (
                    <div className="absolute top-3 left-3 flex items-center text-xs text-white bg-black/30 px-2 py-1 rounded-full">
                      <AlertCircle size={10} className="mr-1" />
                      Inativa
                    </div>
                  )}

                  {/* Actions no hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleLoadCampaign(campaign)}
                        className="p-2 bg-white/90 text-blue-600 hover:bg-white rounded-lg transition-colors shadow-sm"
                        title="Carregar para edição"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleLoadCampaign(campaign)}
                        className="p-2 bg-white/90 text-green-600 hover:bg-white rounded-lg transition-colors shadow-sm"
                        title="Duplicar campanha"
                      >
                        <Copy size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        disabled={deleting === campaign.id}
                        className="p-2 bg-white/90 text-red-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                        title="Excluir campanha"
                      >
                        {deleting === campaign.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Indicador de mídia */}
                  {campaign.media_base64 && (
                    <div className="absolute bottom-3 left-3 flex items-center text-xs text-white bg-black/50 px-2 py-1 rounded-full">
                      <Eye size={10} className="mr-1" />
                      Imagem
                    </div>
                  )}
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4">
                  {/* Título */}
                  <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-1" title={campaign.name}>
                    {campaign.name}
                  </h3>
                  
                  {/* Preview da Mensagem */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {campaign.message.length > 120 
                        ? campaign.message.slice(0, 120) + '...'
                        : campaign.message
                      }
                    </p>
                  </div>
                  
                  {/* Metadados */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Users size={12} className="text-purple-500" />
                      <span>{getAudienceText(campaign.audience)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar size={12} className="text-blue-500" />
                      <span>Criada em {new Date(campaign.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    {campaign.scheduled_date && (
                      <div className="flex items-center space-x-2">
                        <Clock size={12} className="text-amber-500" />
                        <span>
                          {new Date(campaign.scheduled_date).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(campaign.scheduled_date).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                    
                    {campaign.last_run_at && (
                      <div className="flex items-center space-x-2">
                        <Send size={12} className="text-green-500" />
                        <span>
                          Enviada em {new Date(campaign.last_run_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampanhasSalvas;