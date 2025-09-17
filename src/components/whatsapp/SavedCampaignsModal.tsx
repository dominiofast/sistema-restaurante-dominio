import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Send, Edit, Trash2, Copy, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

interface SavedCampaignsModalProps {
  onClose: () => void;
  onLoadCampaign: (campaign: any) => void;
}

export const SavedCampaignsModal: React.FC<SavedCampaignsModalProps> = ({
  onClose,
  onLoadCampaign
}) => {
  const { currentCompany } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Carregar campanhas salvas
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!currentCompany?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('whatsapp_campaigns')
          .select('id, name, message, audience, status, created_at, scheduled_date, is_active, country')
          .eq('company_id', currentCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setCampaigns(data || []);
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        toast.error('Erro ao carregar campanhas salvas');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [currentCompany?.id]);

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta campanha?')) {
      return;
    }

    try {
      setDeleting(campaignId);
      const { error } = await supabase
        .from('whatsapp_campaigns')
        .delete()
        .eq('id', campaignId);

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
    const campaignData = {
      name: campaign.name + ' (cópia)',
      audience: campaign.audience,
      country: campaign.country || 'BR',
      message: campaign.message,
      scheduledDate: campaign.scheduled_date ? campaign.scheduled_date.split('T')[0] : '',
      scheduledTime: campaign.scheduled_date ? campaign.scheduled_date.split('T')[1]?.slice(0, 5) : '',
      sendNow: false,
      messageLimit: null, // Resetar limite
      selectedContacts: []
    };
    
    onLoadCampaign(campaignData);
    onClose();
    toast.success('Campanha carregada para edição');
  };

  const getStatusColor = (status: string, isActive: boolean) => {
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

  const getStatusText = (status: string, isActive: boolean) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <MessageSquare className="text-purple-600" size={20} />
              <span>Campanhas Salvas</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie suas campanhas de WhatsApp salvas, agendadas e enviadas
          </p>
        </div>

        {/* Lista de campanhas */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-purple-600" size={32} />
              <span className="ml-3 text-gray-600">Carregando campanhas...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma campanha salva encontrada</p>
              <p className="text-sm mt-1">Salve campanhas como rascunho para vê-las aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-800">{campaign.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status, campaign.is_active)}`}>
                          {getStatusText(campaign.status, campaign.is_active)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {campaign.message.length > 150 
                          ? campaign.message.slice(0, 150) + '...'
                          : campaign.message
                        }
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users size={12} />
                          <span>
                            {campaign.audience === 'todos-clientes' ? 'Todos os clientes' :
                             campaign.audience === 'clientes-ativos' ? 'Clientes ativos' :
                             'Contatos específicos'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{new Date(campaign.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        {campaign.scheduled_date && (
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>
                              {new Date(campaign.scheduled_date).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(campaign.scheduled_date).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        )}
                        
                        {campaign.status === 'sent' && (
                          <div className="flex items-center space-x-1">
                            <Send size={12} />
                            <span>Campanha enviada</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleLoadCampaign(campaign)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Carregar para edição"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        disabled={deleting === campaign.id}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {campaigns.length} campanhas encontradas
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};