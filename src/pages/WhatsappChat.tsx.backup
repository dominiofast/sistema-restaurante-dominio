import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Mic, 
  Send,
  Check,
  CheckCheck,
  Archive,
  MessageCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Phone,
  VideoIcon,
  Pause,
  Play,
  Bot
} from 'lucide-react';
import { useWhatsAppRealtime } from '@/hooks/useWhatsAppRealtime';
// useMessageNotifications removido - usando apenas notificação global
// useNewMessageNotification removido - usando apenas notificação global
import { AdvancedConnectionStatus } from '@/components/whatsapp/ConnectionStatus';
import { MessageList } from '@/components/whatsapp/MessageList';
import { ChatSidebar } from '@/components/whatsapp/ChatSidebar';
// NewMessageNotification removida - usando apenas notificação global

import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ContactAvatar } from '@/components/whatsapp/ContactAvatar';
import { TypingMessage } from '@/components/ui/typing-indicator';
import whatsappBg from '@/assets/whatsapp-bg.svg';
import { useSearchParams } from 'react-router-dom';
import '@/styles/chat-layout.css';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isFromMe: boolean;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'audio' | 'document';
  messageId?: string;
  senderName?: string;
  senderAvatar?: string;
}

interface Chat {
  id: string;
  chatId: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  phoneNumber: string;
  messages: Message[];
}

// Função para limpar o nome do contato removendo domínios do WhatsApp
const cleanContactName = (name: string): string => {
  if (!name) return 'Contato';
  
  // Remove domínios comuns do WhatsApp (@c.us, @g.us, @s.whatsapp.net)
  const cleanName = name
    .replace(/@c\.us$/, '')
    .replace(/@g\.us$/, '')
    .replace(/@s\.whatsapp\.net$/, '')
    .replace(/^\+?55/, '') // Remove código do país brasileiro se presente
    .trim();
  
  // Se após a limpeza o nome ficou vazio ou é apenas números, retorna "Contato"
  if (!cleanName || /^\d+$/.test(cleanName)) {
    return 'Contato';
  }
  
  return cleanName;
};

// Função para formatar número de telefone
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove domínios do WhatsApp se presentes
  const cleanPhone = phone
    .replace(/@c\.us$/, '')
    .replace(/@g\.us$/, '')
    .replace(/@s\.whatsapp\.net$/, '');
  
  // Se começar com 55, formata como número brasileiro
  if (cleanPhone.startsWith('55') && cleanPhone.length === 13) {
    const ddd = cleanPhone.substring(2, 4);
    const numero = cleanPhone.substring(4);
    return `+55 (${ddd}) ${numero.substring(0, 5)}-${numero.substring(5)}`;
  }
  
  // Se for um número com 11 dígitos (celular brasileiro)
  if (cleanPhone.length === 11) {
    const ddd = cleanPhone.substring(0, 2);
    const numero = cleanPhone.substring(2);
    return `(${ddd}) ${numero.substring(0, 5)}-${numero.substring(5)}`;
  }
  
  // Se for um número com 10 dígitos (fixo brasileiro)
  if (cleanPhone.length === 10) {
    const ddd = cleanPhone.substring(0, 2);
    const numero = cleanPhone.substring(2);
    return `(${ddd}) ${numero.substring(0, 4)}-${numero.substring(4)}`;
  }
  
  return cleanPhone;
};

// Normaliza número de telefone para comparação (apenas dígitos, remove sufixos do WhatsApp e 55 inicial opcional)
const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  const onlyDigits = phone
    .replace(/@c\.us$/, '')
    .replace(/@g\.us$/, '')
    .replace(/@s\.whatsapp\.net$/, '')
    .replace(/\D/g, '');
  // Remove 55 inicial se existir
  return onlyDigits.startsWith('55') ? onlyDigits.substring(2) : onlyDigits;
};

// Remove prefixo indevido inserido em mensagens antigas
const sanitizeMessage = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/^(?:\s*\/\/\s*Ajusta\s+cores\s+e\s+adiciona\s+caudas\s*\n?)+/i, '')
    .trim();
};

// Função para sanitizar links sem quebrar o preview
const sanitizeLinks = (text: string): string => {
  if (!text) return text;
  // Simplesmente retorna o texto sem modificações nos links
  return text;
};

function WhatsappChat() {
  const { currentCompany } = useAuth();
  const { companyInfo } = useCompanyInfo();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [pedidoWizard, setPedidoWizard] = useState<{
    etapa: 'idle' | 'produtos' | 'entrega' | 'pagamento' | 'confirmacao' | 'finalizado';
    produtos: Array<{ nome: string; quantidade: number }>;
    entrega: null | { tipo: 'delivery' | 'retirada'; endereco?: string };
    pagamento: null | { forma: string };
    resumo: string;
  } | null>(null);
  const [wizardMessage, setWizardMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integration, setIntegration] = useState<any>(null);
  const effectiveCompanyId = integration?.company_id || currentCompany?.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const selectedChatIdRef = useRef<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const SELECTED_CHAT_KEY = 'whatsapp:selectedChatId';
  const AI_PAUSED_KEY_PREFIX = 'whatsapp:aiPaused:'; // persistência por chat
  const [isAIPaused, setIsAIPaused] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // Notificação agora é global - removida daqui

  // Buscar integração WhatsApp
  useEffect(() => {
    const fetchIntegration = async () => {
      if (!currentCompany?.id) return;
      
      try {
        const { data, error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'whatsapp_integrations')
          /* .select\( REMOVIDO */ ; //'*')
          /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
          /* .eq\( REMOVIDO */ ; //'purpose', 'primary')
          /* .maybeSingle\( REMOVIDO */ ; //);
        
        if (error || !data) {
          console.error('Erro ao buscar integração:', error);
          setError('Integração WhatsApp (primary) não configurada');
          setLoading(false);
          return;
        }
        
        setIntegration(data);
        console.log('🧭 Integração carregada. company_id efetivo:', data.company_id);
      } catch (err) {
        console.error('Erro na busca da integração:', err);
        setError('Erro ao buscar integração WhatsApp');
        setLoading(false);
      }
    };
    
  fetchIntegration();

  // Rodar limpeza de mensagens antigas com prefixo indevido
  if (currentCompany?.id) {
    /* supabase REMOVIDO */ null; //functions
      .invoke('cleanup-whatsapp-comments', { body: { company_id: currentCompany.id } })
      .catch(() => {});
  }

  }, [currentCompany]);

  // Sincronizar estado de pausa quando o chat muda
  useEffect(() => {
    const chatId = selectedChat?.chatId;
    if (!currentCompany?.id || !chatId) return;
    const localKey = AI_PAUSED_KEY_PREFIX + chatId;
    const saved = localStorage.getItem(localKey);
    if (saved !== null) {
      setIsAIPaused(saved === 'true');
    }
    // Buscar no banco para garantir consistência
    const syncAIPausedState = async () => {
      try {
        const { data } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'whatsapp_chats')
          /* .select\( REMOVIDO */ ; //'ai_paused')
          /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
          /* .eq\( REMOVIDO */ ; //'chat_id', chatId)
          /* .maybeSingle\( REMOVIDO */ ; //);
        
        if (data && typeof data.ai_paused === 'boolean') {
          setIsAIPaused(data.ai_paused);
          localStorage.setItem(localKey, String(data.ai_paused));
        }
      } catch (error) {
        console.error('Erro ao sincronizar estado da IA:', error);
      }
    };
    
    syncAIPausedState();
  }, [selectedChat?.chatId, currentCompany?.id]);

  // Sincronizar avatar do contato quando um chat é selecionado
  useEffect(() => {
    const syncContactAvatar = async () => {
      if (!selectedChat || !currentCompany?.id) return;
      
      // Verificar se o chat já tem avatar
      if (selectedChat.avatar) return;
      
      try {
        console.log('🔄 Sincronizando avatar para:', selectedChat.name);
        
        // Chamar função para sincronizar avatar
        const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('sync-contact-avatars', {
          body: {
            company_id: currentCompany.id,
            phone_numbers: [selectedChat.phoneNumber.replace(/\D/g, '')]
          }
        });
        
        if (error) {
          console.error('Erro ao sincronizar avatar:', error);
          return;
        }
        
        if (data && data.updated > 0) {
          console.log('✅ Avatar sincronizado com sucesso');
          // Recarregar chats para mostrar o novo avatar
          fetchChats();
        }
      } catch (error) {
        console.error('Erro ao sincronizar avatar:', error);
      }
    };
    
    syncContactAvatar();
  }, [selectedChat?.chatId, currentCompany?.id]);

  // Buscar chats com otimização para velocidade máxima
  const fetchChats = async () => {
    const companyIdToUse = effectiveCompanyId;
    if (!companyIdToUse) return;
    
    try {
      console.log('⚡ CARREGANDO CHATS - MODO SUPER RÁPIDO');

      const { data: chatsData, error: chatsError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'whatsapp_chats')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', companyIdToUse)
        /* .order\( REMOVIDO */ ; //'last_message_time', { ascending: false });
      
      if (chatsError) throw chatsError;
      
      const { data: messagesData, error: messagesError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'whatsapp_messages')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', companyIdToUse)
        /* .order\( REMOVIDO */ ; //'timestamp', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      // Tentar resolver nomes reais dos clientes via tabela clientes
      const phoneList = Array/* .from REMOVIDO */ ; //new Set((chatsData || [])
        .map((c: any) => normalizePhone(c.contact_phone || ''))
        .filter((p: string) => !!p)));

      let clientesMap = new Map<string, string>();
      if (phoneList.length > 0) {
        const { data: clientesData } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'clientes')
          /* .select\( REMOVIDO */ ; //'nome, telefone')
          /* .eq\( REMOVIDO */ ; //'company_id', companyIdToUse)
          .in('telefone', phoneList);
        (clientesData || []).forEach((cli: any) => {
          clientesMap.set(normalizePhone(cli.telefone || ''), cli.nome);
        });
      }

      const chatsWithMessages = chatsData.map((chat: any) => {
        const chatMessages = messagesData
          .filter((msg: any) => msg.chat_id === chat.chat_id)
          .map((msg: any) => ({
            id: msg.message_id,
            content: sanitizeMessage(msg.message_content),
            timestamp: new Date(msg.timestamp),
            isFromMe: msg.is_from_me,
            status: msg.status as 'sent' | 'delivered' | 'read',
            type: msg.message_type as 'text' | 'image' | 'audio' | 'document',
            messageId: msg.message_id,
            senderName: msg.is_from_me ? 'Eu' : (msg.contact_name || chat.contact_name || 'Contato'),
            senderAvatar: msg.is_from_me ? undefined : (msg.contact_avatar || chat.contact_avatar)
          }));

        const normalized = normalizePhone(chat.contact_phone || '');
        const nameFromChat = (chat.contact_name && chat.contact_name.trim() && chat.contact_name.trim().toLowerCase() !== 'desconhecido' && !/^\d+$/.test(chat.contact_name.trim()))
          ? cleanContactName(chat.contact_name)
          : '';
        const resolvedName = nameFromChat || clientesMap.get(normalized) || '';

        return {
          id: chat.id.toString(),
          chatId: chat.chat_id,
          name: resolvedName || formatPhoneNumber(chat.contact_phone) || 'Contato',
          phoneNumber: formatPhoneNumber(chat.contact_phone),
          avatar: chat.contact_avatar || undefined,
          lastMessage: chat.last_message || '',
          timestamp: new Date(chat.last_message_time || chat.created_at),
          unreadCount: chat.unread_count || 0,
          messages: chatMessages
        };
      });

      setChats(chatsWithMessages);
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      setError('Erro ao carregar conversas');
    }
  };

  // Função para criar/atualizar chat localmente
  const upsertChatLocally = (newMessage: any) => {
    const message: Message = {
      id: newMessage.message_id,
      content: sanitizeMessage(newMessage.message_content),
      timestamp: new Date(newMessage.timestamp),
      isFromMe: newMessage.is_from_me,
      status: newMessage.status,
      type: newMessage.message_type,
      messageId: newMessage.message_id,
      senderName: newMessage.is_from_me ? 'Eu' : (newMessage.contact_name || 'Contato'),
      senderAvatar: newMessage.is_from_me ? undefined : newMessage.contact_avatar
    };
    
    // Notificação agora é global - não precisa chamar aqui
    
    setChats(prevChats => {
      const existingChatIndex = prevChats.findIndex(chat => chat.chatId === newMessage.chat_id);
      
      if (existingChatIndex >= 0) {
        const updatedChats = [...prevChats];
        const existingChat = updatedChats[existingChatIndex];
        
        // Verifica se a mensagem já existe para evitar duplicatas
        const messageExists = existingChat.messages.some(msg => msg.id === message.id);
        if (!messageExists) {
          updatedChats[existingChatIndex] = {
            ...existingChat,
            messages: [...existingChat.messages, message],
            lastMessage: message.content,
            timestamp: message.timestamp
          };
        }
        
        return updatedChats;
      } else {
        // Criar novo chat
        const newChat: Chat = {
          id: Date.now().toString(),
          chatId: newMessage.chat_id,
          name: (newMessage.contact_name && newMessage.contact_name.trim() && newMessage.contact_name.trim().toLowerCase() !== 'desconhecido')
            ? cleanContactName(newMessage.contact_name)
            : (formatPhoneNumber(newMessage.contact_phone) || 'Contato'),
          phoneNumber: formatPhoneNumber(newMessage.contact_phone),
          avatar: newMessage.contact_avatar || undefined,
          lastMessage: message.content,
          timestamp: message.timestamp,
          unreadCount: newMessage.is_from_me ? 0 : 1,
          messages: [message]
        };
        
        return [newChat, ...prevChats];
      }
    });
    
    // Atualizar chat selecionado se for o mesmo
    if (selectedChat && selectedChat.chatId === newMessage.chat_id) {
      setSelectedChat(prev => {
        if (!prev) return null;
        const messageExists = prev.messages.some(msg => msg.id === message.id);
        if (!messageExists) {
          return {
            ...prev,
            messages: [...prev.messages, message],
            lastMessage: message.content,
            timestamp: message.timestamp
          };
        }
        return prev;
      });
    }
  };

  // handleNotificationChatSelect removido - notificação agora é global
const processPedidoWizard = async (input: string) => {
  if (!pedidoWizard) return;
  
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let etapa = pedidoWizard.etapa;
  let produtos = pedidoWizard.produtos;
  let entrega = pedidoWizard.entrega;
  let pagamento = pedidoWizard.pagamento;
  let resumo = pedidoWizard.resumo;

  if (etapa === 'produtos') {
    // Espera: "Produto x quantidade" ou "finalizar"
    if (/finalizar/i.test(input)) {
      if (produtos.length === 0) {
        setWizardMessage('Adicione pelo menos um produto antes de finalizar. Informe o nome do produto e a quantidade.');
        return;
      }
      etapa = 'entrega';
      setWizardMessage('Qual a forma de entrega? Responda "delivery" ou "retirada".');
    } else {
      // Tenta extrair produto e quantidade
      const match = input.match(/(.+)\s+x\s*(\d+)/i);
      if (match) {
        produtos = [...produtos, { nome: match[1].trim(), quantidade: parseInt(match[2]) }];
        setWizardMessage('Produto adicionado! Informe outro produto e quantidade, ou digite "finalizar" para continuar.');
      } else {
        setWizardMessage('Por favor, informe o produto no formato: "Nome do Produto x quantidade".');
      }
    }
  } else if (etapa === 'entrega') {
    if (/delivery/i.test(input)) {
      etapa = 'pagamento';
      entrega = { tipo: 'delivery', endereco: undefined };
      setWizardMessage('Informe o endereço de entrega:');
    } else if (/retirada/i.test(input)) {
      etapa = 'pagamento';
      entrega = { tipo: 'retirada' };
      setWizardMessage('Qual a forma de pagamento? (Dinheiro, Cartão, Pix, etc.)');
    } else if (entrega?.tipo === 'delivery' && !entrega.endereco) {
      entrega = { tipo: 'delivery', endereco: input };
      etapa = 'pagamento';
      setWizardMessage('Qual a forma de pagamento? (Dinheiro, Cartão, Pix, etc.)');
    } else {
      setWizardMessage('Escolha "delivery" ou "retirada".');
    }
  } else if (etapa === 'pagamento') {
    pagamento = { forma: input };
    etapa = 'confirmacao';
    // Monta resumo
    resumo = `Resumo do Pedido:\nProdutos:\n` + produtos.map(p => `- ${p.nome} x${p.quantidade}`).join('\n') +
      `\nEntrega: ${entrega?.tipo}${entrega?.endereco ? ' - ' + entrega.endereco : ''}\nPagamento: ${pagamento.forma}`;
    setWizardMessage(resumo + '\n\nDigite "confirmar" para lançar o pedido ou "cancelar" para abortar.');
  } else if (etapa === 'confirmacao') {
    if (/confirmar/i.test(input)) {
      etapa = 'finalizado';
      setWizardMessage('Pedido lançado! Aguarde a confirmação.');
      // Aqui você pode chamar a função de lançamento de pedido (exemplo fictício):
      // await criarPedidoNoBackend(produtos, entrega, pagamento);
    } else if (/cancelar/i.test(input)) {
      setPedidoWizard(null);
      setWizardMessage('Pedido cancelado.');
      return;
    } else {
      setWizardMessage('Digite "confirmar" para lançar o pedido ou "cancelar" para abortar.');
    }
  }

  setPedidoWizard({ etapa, produtos, entrega, pagamento, resumo });
};

const handlePauseAI = async () => {
  const newPausedState = !isAIPaused;
  setIsAIPaused(newPausedState);
  
  // Persistir por conversa no localStorage
  if (selectedChat?.chatId) {
    localStorage.setItem(AI_PAUSED_KEY_PREFIX + selectedChat.chatId, newPausedState.toString());
  }
  
  // CORRIGIDO: Salvar APENAS para a empresa atual - sem sincronização cross-empresa
  if (currentCompany?.id && selectedChat?.chatId) {
    try {
      console.log(`🎯 Pausando IA APENAS para empresa: ${currentCompany.id} | Chat: ${selectedChat.chatId}`);
      
      const { error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'whatsapp_chats')
        /* .update\( REMOVIDO */ ; //{ ai_paused: newPausedState, updated_at: new Date().toISOString() })
        /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
        /* .eq\( REMOVIDO */ ; //'chat_id', selectedChat.chatId);
        
      if (error) throw error;
      
      console.log(`✅ Pausa aplicada com sucesso para empresa: ${currentCompany.id}`);
      
      // REMOVIDO: Sincronização entre empresas (era isso que causava o problema)
    } catch (err) {
      console.error('Erro ao salvar estado de pausa:', err);
      toast.error('Erro ao salvar pausa deste chat');
    }
  }
  
  // Feedback visual e sonoro
  if (newPausedState) {
    toast.warning('🤖 IA Pausada - As mensagens não serão processadas automaticamente', {
      duration: 3000,
      position: 'top-center'
    });
    if (pedidoWizard) {
      setPedidoWizard(null);
      setWizardMessage('Agente de IA pausado.');
    }
  } else {
    toast.success('🤖 IA Retomada - Pronta para processar mensagens', {
      duration: 3000,
      position: 'top-center'
    });
  }
  
  // Log para debug
  console.log('IA Status:', newPausedState ? 'PAUSADA' : 'ATIVA');
};
const sendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !integration || !effectiveCompanyId) return;
    
    // Mostrar typing indicator quando não é AI pausado e vai processar mensagem
    if (!isAIPaused) {
      setIsAITyping(true);
      
      if (pedidoWizard) {
        try {
          await processPedidoWizard(messageText.trim());
          setMessageText('');
        } finally {
          setIsAITyping(false);
        }
        return;
      }
      if (/fazer pedido|novo pedido|quero pedir/i.test(messageText.trim())) {
        setPedidoWizard({
          etapa: 'produtos',
          produtos: [],
          entrega: null,
          pagamento: null,
          resumo: '',
        });
        setWizardMessage('Vamos montar seu pedido! Informe o nome do produto e quantidade (ex: Pizza Margherita x 2). Quando terminar, digite "finalizar".' );
        setMessageText('');
        setIsAITyping(false);
        return;
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: sanitizeMessage(messageText),
      timestamp: new Date(),
      isFromMe: true,
      status: 'sent',
      type: 'text'
    };

    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: newMessage.content,
      timestamp: new Date()
    });

    setChats(prev => prev.map(chat =>
      chat.id === selectedChat.id
        ? { ...chat, lastMessage: newMessage.content, timestamp: new Date(), messages: [...chat.messages, newMessage] }
        : chat
    ));

    const currentMessageText = newMessage.content;
    setMessageText('');

    try {
      // Normalizar telefone para formato E.164 (Brasil) sem máscara
      const toDigits = normalizePhone(selectedChat.phoneNumber);
      const to = toDigits.startsWith('55') ? toDigits : `55${toDigits}`;

      const response = await fetch(`https://${integration.host}/rest/sendMessage/${integration.instance_key}/text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageData: {
            to,
            text: sanitizeLinks(currentMessageText),
            preview_url: false,
            linkPreview: false
          }
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }

      const messageId = `${Date.now()}_${Math.random()}`;
      const { error: saveError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'whatsapp_messages')
        /* .insert\( REMOVIDO */ ; //{
          company_id: effectiveCompanyId,
          chat_id: selectedChat.chatId,
          contact_name: selectedChat.name,
          contact_phone: selectedChat.phoneNumber,
          message_id: messageId,
          message_content: currentMessageText,
          message_type: 'text',
          is_from_me: true,
          status: 'sent',
          timestamp: new Date().toISOString()
        });

      if (saveError) {
        console.error('Erro ao salvar mensagem no banco:', saveError);
      } else {
        const { error: updateChatError } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'whatsapp_chats')
          /* .update\( REMOVIDO */ ; //{
            last_message: currentMessageText,
            last_message_time: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          /* .eq\( REMOVIDO */ ; //'company_id', effectiveCompanyId)
          /* .eq\( REMOVIDO */ ; //'chat_id', selectedChat.chatId);
        if (updateChatError) {
          console.error('Erro ao atualizar chat:', updateChatError);
        }
        toast.success('Mensagem enviada!');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsAITyping(false);
    }
  };

  // Efeito para scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Sincroniza ref com chat selecionado para evitar re-render desnecessário em subscriptions
  useEffect(() => {
    selectedChatIdRef.current = selectedChat?.chatId || null;
  }, [selectedChat?.chatId]);

  // Real-time com hook otimizado
  const { 
    isConnected, 
    isReconnecting, 
    forceReconnect,
    forceReconnectAdvanced,
    connectionStatus,
    diagnostics,
    runDiagnostic,
    getFallbackState,
    forceFallbackMode,
    getConnectionMetrics,
    getConnectionQuality,
    getConnectionAlerts,
    resolveAlert,
    quality,
    latency
  } = useWhatsAppRealtime({
    companyId: effectiveCompanyId,
    onNewMessage: (newMessage) => {
      console.log('📨 MENSAGEM RECEBIDA VIA REALTIME:', newMessage);
      upsertChatLocally(newMessage);
      if (!newMessage.is_from_me && !isAIPaused) {
        console.log('IA processaria mensagem:', newMessage.message_content);
      }
    },
    onChatUpdate: (payload) => {
      console.log('📝 CHAT ATUALIZADO VIA REALTIME:', payload);
      if (payload.eventType === 'UPDATE') {
        const updatedChat = payload.new;
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.chatId === updatedChat.chat_id
              ? { ...chat, unreadCount: updatedChat.unread_count || 0 }
              : chat
          )
        );
      }
    }
  });

  // Notificações agora são globais - removidas daqui

  // Carregar chats inicial + forçar reconexão real-time
  useEffect(() => {
    if (!currentCompany?.id || !integration) return;
    if (!hasInitialized.current) {
      setLoading(true);
      setError(null);
      fetchChats().finally(() => {
        setLoading(false);
        hasInitialized.current = true;
        
        // Forçar reconexão real-time após inicialização
        console.log('🔥 FORÇANDO RECONEXÃO REAL-TIME APÓS INICIALIZAÇÃO');
        setTimeout(() => {
          forceReconnect();
        }, 2000);
      });
    }
  }, [currentCompany?.id, integration?.id, forceReconnect]);

  // Função para marcar chat como lido
  const markChatAsRead = async (chatId: string) => {
    if (!currentCompany?.id) return;
    
    try {
      // Atualizar no banco de dados
      const { error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'whatsapp_chats')
        /* .update\( REMOVIDO */ ; //{ unread_count: 0 })
        /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
        /* .eq\( REMOVIDO */ ; //'chat_id', chatId);
      
      if (error) {
        console.error('Erro ao marcar chat como lido:', error);
        return;
      }
      
      // Atualizar localmente
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.chatId === chatId
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      );
      
      console.log('✅ Chat marcado como lido:', chatId);
    } catch (error) {
      console.error('Erro ao marcar chat como lido:', error);
    }
  };

  // Restaurar conversa selecionada (URL ou localStorage)
  useEffect(() => {
    const urlChatId = searchParams.get('chatId');
    const storedChatId = localStorage.getItem(SELECTED_CHAT_KEY);
    const chatId = urlChatId || storedChatId;
    if (!selectedChat && chatId && chats.length > 0) {
      const found = chats.find(c => c.chatId === chatId);
      if (found) {
        setSelectedChat(found);
        // Marcar como lido se tem mensagens não lidas
        if (found.unreadCount > 0) {
          markChatAsRead(chatId);
        }
        if (!urlChatId) {
          const sp = new URLSearchParams(searchParams);
          sp.set('chatId', chatId);
          setSearchParams(sp, { replace: true });
        }
      }
    }
  }, [chats]);

  // Persistir quando trocar a conversa
  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem(SELECTED_CHAT_KEY, selectedChat.chatId);
    }
  }, [selectedChat?.chatId]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.phoneNumber.includes(searchTerm) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ marginTop: '-64px', paddingTop: '64px' }}>
      {/* Conteúdo principal */}
      <div className="flex w-full h-full">
        {/* Sidebar otimizada */}
        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onChatSelect={(chat) => {
            setSelectedChat(chat);
            localStorage.setItem(SELECTED_CHAT_KEY, chat.chatId);
            const sp = new URLSearchParams(searchParams);
            sp.set('chatId', chat.chatId);
            setSearchParams(sp, { replace: true });
            
            // Marcar como lido se tem mensagens não lidas
            if (chat.unreadCount > 0) {
              markChatAsRead(chat.chatId);
            }
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={loading}
          companyName={(companyInfo?.nome_estabelecimento || currentCompany?.name) ?? 'Minha Loja'}
        />

      {/* Wizard do Pedido IA - movido para cima */}
      {pedidoWizard && selectedChat && (
        <div className="chat-wizard">
          <div className="text-blue-700 font-semibold text-lg">Assistente de Pedido</div>
          <div className="text-gray-800 whitespace-pre-line">{wizardMessage}</div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua resposta..."
              autoFocus
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
            >Enviar</button>
          </div>
        </div>
      )}

      {/* Área de Chat */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Banner de Status da IA */}
          {isAIPaused && (
            <div className="bg-red-500 text-white py-2 px-4 flex items-center justify-between gap-2 animate-pulse">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold">IA PAUSADA - Mensagens não serão processadas automaticamente</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDiagnostic(!showDiagnostic)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
                  title="Mostrar diagnóstico do sistema"
                >
                  {showDiagnostic ? 'Ocultar Diagnóstico' : 'Diagnóstico'}
                </button>
                <button
                  onClick={async () => {
                    if (!currentCompany?.id) return;
                    
                    // Test removido temporariamente
                    const result = 'Teste não disponível';
                    
                    toast.info('Teste Realtime', {
                      description: result,
                      duration: 5000
                    });
                  }}
                  className="px-3 py-1 bg-blue-500/80 hover:bg-blue-600/80 rounded text-sm transition-colors"
                  title="Teste rápido do sistema"
                >
                  Teste Rápido
                </button>
                <button 
                  onClick={handlePauseAI}
                  className="ml-2 px-3 py-1 bg-white text-red-500 rounded-full text-sm font-bold hover:bg-gray-100 transition-all"
                >
                  Retomar IA
                </button>
              </div>
            </div>
          )}

          {/* Painel de Diagnóstico */}
          {showDiagnostic && (
            <div className="bg-gray-50 border-b border-gray-200 p-4 max-h-96 overflow-y-auto space-y-4">
              <AdvancedConnectionStatus
                isConnected={isConnected}
                isReconnecting={isReconnecting}
                retryCount={connectionStatus?.retryCount || 0}
                lastConnected={connectionStatus?.lastConnected || null}
                quality={quality}
                latency={latency}
                onForceReconnect={forceReconnectAdvanced}
                getConnectionMetrics={getConnectionMetrics}
                getConnectionQuality={getConnectionQuality}
                getConnectionAlerts={getConnectionAlerts}
                resolveAlert={resolveAlert}
                getFallbackState={getFallbackState}
                forceFallbackMode={forceFallbackMode}
                onRunDiagnostic={runDiagnostic}
              />
              
              {/* Diagnóstico removido temporariamente */}
            </div>
          )}
          
          {/* Header do Chat - Melhorado similar ao WhatsApp Web */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0" style={{ marginTop: '0' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ContactAvatar
                  name={selectedChat.name}
                  avatar={selectedChat.avatar}
                  size="lg"
                  showOnlineIndicator={selectedChat.unreadCount > 0}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900 truncate">{selectedChat.name}</h2>
                    {selectedChat.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-medium">
                        {selectedChat.unreadCount > 99 ? '99+' : selectedChat.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="truncate">{selectedChat.phoneNumber}</span>
                    <span>•</span>
                    <span className={`font-medium ${selectedChat.unreadCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {selectedChat.unreadCount > 0 ? 'online' : 'visto por último'}
                    </span>
                    {selectedChat.unreadCount === 0 && (
                      <>
                        <span>•</span>
                        <span>{format(selectedChat.timestamp, 'HH:mm', { locale: ptBR })}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span>Loja: {(companyInfo?.nome_estabelecimento || currentCompany?.name) ?? 'Minha Loja'}</span>
                    <span>•</span>
                    <span className={`font-semibold ${isAIPaused ? 'text-red-500' : 'text-green-500'}`}>
                      IA {isAIPaused ? 'Pausada' : 'Ativa'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Chamada de vídeo"
                >
                  <VideoIcon className="h-5 w-5 text-gray-500" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Chamada de voz"
                >
                  <Phone className="h-5 w-5 text-gray-500" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Buscar mensagens"
                >
                  <Search className="h-5 w-5 text-gray-500" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Mais opções"
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Mensagens com componente otimizado */}
          <MessageList
            messages={selectedChat.messages}
            isTyping={isAITyping && !isAIPaused}
            typingName={companyInfo?.nome_estabelecimento || currentCompany?.name || "Assistente"}
            autoScroll={true}
          />

          {/* Input de Mensagem */}
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-end gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Smile className="h-5 w-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isAIPaused ? "IA pausada - digite sua mensagem..." : "Digite uma mensagem..."}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              {/* Botão de Pausar/Retomar IA - MELHORADO */}
              <button 
                onClick={handlePauseAI}
                className={`relative p-3 rounded-full transition-all transform hover:scale-110 shadow-lg ${
                  isAIPaused 
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                title={isAIPaused ? 'IA Pausada - Clique para retomar' : 'IA Ativa - Clique para pausar'}
              >
                {isAIPaused ? (
                  <Play className="h-6 w-6" />
                ) : (
                  <Pause className="h-6 w-6" />
                )}
                {/* Indicador visual de status */}
                <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
                  isAIPaused ? 'bg-red-600' : 'bg-green-600'
                } animate-ping`}></span>
                <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
                  isAIPaused ? 'bg-red-600' : 'bg-green-600'
                }`}></span>
              </button>
              <button 
                onClick={sendMessage}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {messageText ? (
                  <Send className="h-5 w-5 text-blue-500" />
                ) : (
                  <Mic className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 min-w-0">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <MessageCircle className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-900 mb-3">WhatsApp Business</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Selecione uma conversa para começar a enviar mensagens.
            </p>
          </div>
        </div>
      )}
      {/* Notificação removida - usando apenas a global */}
      </div>
    </div>
  );
}

export default WhatsappChat;
