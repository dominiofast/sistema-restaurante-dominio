import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Calendar, Users, Eye, TestTube, Clock, Check, ChevronDown, Bold, Italic, Phone, Camera, Paperclip, Image, X, Upload, Loader2, Search, Save, List } from 'lucide-react';
import { useWhatsappCampaign } from '@/hooks/useWhatsappCampaign';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
// SUPABASE REMOVIDO
import { ClientSelector } from '@/components/whatsapp/ClientSelector';

const CampanhaWhatsApp = () => {;
  const { currentCompany } = useAuth();
  const { loading, sending, sendCampaign, sendTestMessage, getClientes, scheduleCampaign } = useWhatsappCampaign();
  
  const [campaignData, setCampaignData] = useState({
    name: '',
    audience: 'todos-clientes',
    country: 'BR',
    message: '',
    scheduledDate: '',
    scheduledTime: '',
    sendNow: true,
    messageLimit: null, // Novo: limite de mensagens
    selectedContacts: [] // Novo: contatos específicos selecionados
  });

  const [previewMode, setPreviewMode] = useState('mobile');
  const [messageLength, setMessageLength] = useState(0);
  const [attachedImage, setAttachedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [clientesCount, setClientesCount] = useState(0);
  const [testPhone, setTestPhone] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  
  // Novos estados para busca de contatos
  const [searchTerm, setSearchTerm] = useState('');
  const [availableClients, setAvailableClients] = useState([]);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  
  // Novo estado removido (não precisa mais do modal)
  const [showSavedCampaigns, setShowSavedCampaigns] = useState(false);

  // Carregar dados da campanha se vier do sessionStorage
  useEffect(() => {
    const loadCampaignData = sessionStorage.getItem('loadCampaignData');
    if (loadCampaignData) {
      try {
        const data = JSON.parse(loadCampaignData);
        setCampaignData(data);
        sessionStorage.removeItem('loadCampaignData'); // Limpar após carregar
        toast.success('Campanha carregada para edição');
      } catch (error) {
        console.error('Erro ao carregar dados da campanha:', error);
      }
    }
  }, []);

  useEffect(() => {
    // SEO básico da página
    document.title = 'Campanha WhatsApp Marketing | Domínio Tech';
    const desc = 'Envie campanhas de WhatsApp Marketing para seus clientes.';
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

  useEffect(() => {
    setMessageLength(campaignData.message.length);
  }, [campaignData.message]);

  // Buscar contagem de clientes quando o público-alvo mudar
  useEffect(() => {
    const fetchClientesCount = async () => {
      if (currentCompany?.id) {
        try {
          if (campaignData.audience === 'contatos-especificos') {
            // Para contatos específicos, contar apenas os selecionados
            const effectiveCount = campaignData.messageLimit 
              ? Math.min(campaignData.selectedContacts.length, campaignData.messageLimit);
              : campaignData.selectedContacts.length;
            setClientesCount(effectiveCount);
          }  catch (error) { console.error('Error:', error); }else {
            const clientes = await getClientes(campaignData.audience);
            const effectiveCount = campaignData.messageLimit 
              ? Math.min(clientes.length, campaignData.messageLimit);
              : clientes.length;
            setClientesCount(effectiveCount);

        } catch (error) {
          console.error('Erro ao buscar clientes:', error);
          setClientesCount(0);

      }
    };

    fetchClientesCount();
  }, [campaignData.audience, campaignData.selectedContacts, campaignData.messageLimit, currentCompany?.id, getClientes]);

  const handleInputChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value;
    }));
  };

  const handleImageUpload = (event) => {;
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Tipo de arquivo não suportado. Use: JPG, PNG, GIF ou WebP');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 5MB');
        return;
      }
      
      setAttachedImage(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {;
    setAttachedImage(null);
    setImagePreview(null);
  };

  const formatMessage = (text) => {
    // Simula formatação básica do WhatsApp
    return text
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
      .replace(/~([^~]+)~/g, '<del>$1</del>');
  };

  // Função para enviar campanha
  const handleSendCampaign = async () => {
    if (!campaignData.name.trim()) {;
      toast.error('Por favor, insira um nome para a campanha');
      return;
    }

    if (!campaignData.message.trim()) {
      toast.error('Por favor, insira uma mensagem');
      return;
    }

    if (!campaignData.sendNow && (!campaignData.scheduledDate || !campaignData.scheduledTime)) {
      toast.error('Por favor, defina data e horário para agendamento');
      return;
    }

    if (clientesCount === 0) {
      toast.error('Nenhum cliente encontrado para envio');
      return;
    }

    const confirmMessage = `Confirma o envio da campanha "${campaignData.name}" para ${clientesCount} clientes?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const campaignPayload = {
      ...campaignData,
      imageFile: attachedImage;
    };

    const result = await sendCampaign(campaignPayload);
    
    if (result.success) {
      // Limpar formulário após envio bem-sucedido
      setCampaignData({
        name: '',
        audience: 'todos-clientes',
        country: 'BR',
        message: '',
        scheduledDate: '',
        scheduledTime: '',
        sendNow: true,
        messageLimit: null,
        selectedContacts: []
      });
      setAttachedImage(null);
      setImagePreview(null);
    }
  };

  // Função para enviar mensagem de teste
  const handleSendTest = async () => {
    if (!testPhone.trim()) {;
      toast.error('Por favor, insira um número de telefone para teste');
      return;
    }

    if (!campaignData.message.trim()) {
      toast.error('Por favor, insira uma mensagem para testar');
      return;
    }

    const campaignPayload = {
      ...campaignData,
      imageFile: attachedImage;
    };

    const success = await sendTestMessage(campaignPayload, testPhone);
    
    if (success) {
      setShowTestModal(false);
      setTestPhone('');
    }
  };

  // Função para salvar rascunho
  const handleSaveDraft = async () => {
    if (!campaignData.name.trim()) {;
      toast.error('Por favor, insira um nome para a campanha');
      return;
    }

    if (!campaignData.message.trim()) {
      toast.error('Por favor, insira uma mensagem');
      return;
    }

    console.log('Salvando rascunho...', campaignData);

    const campaignPayload = {
      ...campaignData,
      imageFile: attachedImage,
      sendNow: false, // Força como rascunho
      scheduledDate: '', // Limpar datas para garantir que seja rascunho
// scheduledTime: '';
    };

    const success = await scheduleCampaign(campaignPayload);
    
    if (success) {
      toast.success('Campanha salva como rascunho!');
      // Não limpar o formulário para permitir continuar editando
    } else {
      toast.error('Erro ao salvar rascunho');
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' ;
    });
  };

  const WhatsAppPreview = () => (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="bg-white rounded-lg shadow-lg max-w-sm mx-auto">
        {/* Header do WhatsApp */}
        <div className="bg-green-600 text-white p-3 rounded-t-lg flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
            <Users size={16} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Sua Empresa</div>
            <div className="text-xs opacity-90">online</div>
          </div>
          <Phone size={18} />
          <Camera size={18} />
        </div>
        
        {/* Área de mensagens */}
        <div className="p-4 min-h-[300px] bg-gray-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}>
          {(campaignData.message || imagePreview) && (
            <div className="mb-4">
              <div className="bg-green-500 text-white p-3 rounded-lg rounded-bl-none max-w-[80%] ml-auto">
                {/* Imagem anexada */}
                {imagePreview && (
                  <div className="mb-2">
                    <img 
                      src={imagePreview} 
                      alt="Anexo" 
                      className="w-full rounded-lg max-h-48 object-cover"
                    />
                  </div>
                )}
                
                {/* Texto da mensagem */}
                {campaignData.message && (
                  <div 
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMessage(campaignData.message) }}
                  />
                )}
                
                <div className="text-xs opacity-75 mt-1 flex items-center justify-end space-x-1">
                  <span>{getCurrentTime()}</span>
                  <Check size={12} />
                  <Check size={12} className="-ml-1" />
                </div>
              </div>
            </div>
          )}
          
          {!campaignData.message && !imagePreview && (
            <div className="text-center text-gray-500 mt-20">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>Digite uma mensagem ou anexe uma imagem para ver o preview</p>
            </div>
          )}
        </div>
        
        {/* Footer do WhatsApp */}
        <div className="bg-gray-100 p-3 rounded-b-lg flex items-center space-x-3">
          <Paperclip size={20} className="text-gray-600" />
          <div className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-gray-500">
            Digite uma mensagem
          </div>
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <Send size={16} className="text-white" />
          </div>
        </div>
      </div>
    </div>;
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
            <MessageCircle className="text-green-600" />
            <span>Criando Campanha de WhatsApp</span>
          </h1>
          <p className="text-gray-600 mt-2">Configure e envie mensagens em massa para seus clientes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Users className="text-blue-600" size={20} />
                <span>Informações Gerais</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Campanha
                  </label>
                  <input
                    type="text"
                    value={campaignData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Promoção de Verão 2024"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País Padrão
                    </label>
                    <select
                      value={campaignData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="BR">🇧🇷 Brasil (+55)</option>
                      <option value="US">🇺🇸 Estados Unidos (+1)</option>
                      <option value="AR">🇦🇷 Argentina (+54)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Público-alvo
                    </label>
                    <select
                      value={campaignData.audience}
                      onChange={(e) => handleInputChange('audience', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="todos-clientes">Todos os clientes</option>
                      <option value="clientes-ativos">Clientes ativos</option>
                      <option value="contatos-especificos">Contatos específicos</option>
                    </select>
                  </div>
                </div>

                {/* Seção de contatos específicos */}
                {campaignData.audience === 'contatos-especificos' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Contatos Selecionados
                      </label>
                      <button
                        onClick={() => setShowClientSelector(true)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Search size={16} />
                        <span>Buscar Contatos</span>
                      </button>
                    </div>
                    
                    {campaignData.selectedContacts.length === 0 ? (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Users className="mx-auto mb-2 text-gray-400" size={32} />
                        <p className="text-sm text-gray-600">Nenhum contato selecionado</p>
                        <p className="text-xs text-gray-500">Clique em "Buscar Contatos" para selecionar</p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">
                            {campaignData.selectedContacts.length} contatos selecionados
                          </span>
                          <button
                            onClick={() => handleInputChange('selectedContacts', [])}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Limpar seleção
                          </button>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {campaignData.selectedContacts.slice(0, 5).map((contact, index) => (
                            <div key={contact.id} className="text-xs text-blue-700">
                              • {contact.nome} ({contact.telefone})
                            </div>
                          ))}
                          {campaignData.selectedContacts.length > 5 && (
                            <div className="text-xs text-blue-600">
                              ... e mais {campaignData.selectedContacts.length - 5} contatos
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Limitador de mensagens */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite de Mensagens (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={campaignData.messageLimit || ''}
                    onChange={(e) => handleInputChange('messageLimit', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: 100 (deixe vazio para sem limite)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limita quantas mensagens serão enviadas, mesmo que hajam mais contatos disponíveis
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Check size={16} />
                    <span className="text-sm font-medium">Resumo do Envio</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-green-700">
                    <li>• {clientesCount} mensagens serão enviadas</li>
                    {campaignData.messageLimit && (
                      <li>• Limite aplicado: {campaignData.messageLimit} mensagens</li>
                    )}
                    <li>• Estimativa de tempo: {Math.ceil(clientesCount / 10)} - {Math.ceil(clientesCount / 5)} minutos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mensagem */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <MessageCircle className="text-green-600" size={20} />
                <span>Mensagem</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Conteúdo da Mensagem
                    </label>
                    <span className="text-xs text-gray-500">
                      {messageLength}/4096 caracteres
                    </span>
                  </div>
                  
                  <textarea
                    value={campaignData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Digite sua mensagem aqui...

Dicas de formatação:
*texto* = negrito
_texto_ = itálico
~texto~ = riscado"
                    maxLength={4096}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                    <Bold size={14} />
                    <span>Negrito</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                    <Italic size={14} />
                    <span>Itálico</span>
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Use variáveis como {`{nome}`}, {`{empresa}`} para personalizar suas mensagens automaticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Anexar Imagem */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Image className="text-blue-600" size={20} />
                <span>Anexar Imagem</span>
              </h2>

              <div className="space-y-4">
                {!imagePreview ? (
                  <div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                      <div className="mb-4">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
                            <Image size={16} />
                            <span>Escolher Imagem</span>
                          </span>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Ou arraste e solte uma imagem aqui
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Formatos suportados:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>• JPG/JPEG</div>
                        <div>• PNG</div>
                        <div>• GIF</div>
                        <div>• WebP</div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Tamanho máximo: 5MB | Recomendado: 1080x1080px
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="relative border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{attachedImage?.name}</h4>
                          <p className="text-sm text-gray-600">
                            {(attachedImage?.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              <Check size={12} className="mr-1" />
                              Imagem carregada
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={removeImage}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remover imagem"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        ✅ <strong>Imagem adicionada:</strong> Sua imagem será enviada junto com a mensagem para todos os destinatários.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agendamento */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Calendar className="text-purple-600" size={20} />
                <span>Quando Enviar</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sendTime"
                      checked={campaignData.sendNow}
                      onChange={() => handleInputChange('sendNow', true)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium">Enviar agora</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sendTime"
                      checked={!campaignData.sendNow}
                      onChange={() => handleInputChange('sendNow', false)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium">Agendar envio</span>
                  </label>
                </div>

                {!campaignData.sendNow && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data
                      </label>
                      <input
                        type="date"
                        value={campaignData.scheduledDate}
                        onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário
                      </label>
                      <input
                        type="time"
                        value={campaignData.scheduledTime}
                        onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col gap-4">
                {/* Primeira linha - Teste e Salvar Rascunho */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setShowTestModal(true)}
                    disabled={loading || sending || !campaignData.message.trim()}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <TestTube size={20} />
                    )}
                    <span>Enviar Teste</span>
                  </button>
                  
                  <button 
                    onClick={handleSaveDraft}
                    disabled={loading || sending || !campaignData.message.trim() || !campaignData.name.trim()}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Save size={20} />
                    )}
                    <span>Salvar Rascunho</span>
                  </button>
                </div>
                
                {/* Segunda linha - Enviar e Ver Campanhas */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => window.open('/marketing/campanhas-salvas', '_blank')}
                    className="flex-1 bg-purple-100 text-purple-700 py-3 px-6 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <List size={20} />
                    <span>Ver Campanhas</span>
                  </button>
                  
                  <button 
                    onClick={handleSendCampaign}
                    disabled={loading || sending || !campaignData.message.trim() || !campaignData.name.trim() || clientesCount === 0}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                    <span>{sending ? 'Enviando...' : 'Enviar Campanha'}</span>
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Ao enviar, você concorda com os termos de uso da plataforma
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <Eye className="text-green-600" size={20} />
                  <span>Preview da Mensagem</span>
                </h2>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      previewMode === 'mobile' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              <WhatsAppPreview />

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Caracteres:</span>
                  <span className="font-medium">{messageLength}/4096</span>
                </div>
                
                {attachedImage && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Imagem anexada:</span>
                    <span className="font-medium text-blue-600">{(attachedImage.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimativa de entrega:</span>
                  <span className="font-medium text-green-600">24-48h</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Destinatários:</span>
                  <span className="font-medium">{clientesCount.toLocaleString()} contatos</span>
                </div>
                
                {attachedImage && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      ⚠️ <strong>Atenção:</strong> Campanhas com imagens podem ter tempo de entrega maior devido ao processamento adicional.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Teste */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <TestTube className="text-blue-600" size={20} />
                  <span>Enviar Mensagem de Teste</span>
                </h3>
                <button
                  onClick={() => {
                    setShowTestModal(false);
                    setTestPhone('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do WhatsApp (com DDD)
                  </label>
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="Ex: 11999887766"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Digite apenas números (DDD + número)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Prévia da mensagem:</strong>
                  </p>
                  <div className="mt-2 p-2 bg-white rounded border text-sm">
                    [TESTE] {campaignData.message || 'Sua mensagem aparecerá aqui...'}
                  </div>
                  {attachedImage && (
                    <p className="text-xs text-blue-600 mt-2">
                      ✅ Imagem será incluída no teste
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowTestModal(false);
                    setTestPhone('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendTest}
                  disabled={loading || !testPhone.trim() || !campaignData.message.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{loading ? 'Enviando...' : 'Enviar Teste'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Clientes */}
      {showClientSelector && (
        <ClientSelector
          selectedContacts={campaignData.selectedContacts}
          onContactsChange={(contacts) => handleInputChange('selectedContacts', contacts)}
          onClose={() => setShowClientSelector(false)}
        />
      )}
    </div>
  );
};

export default CampanhaWhatsApp;
