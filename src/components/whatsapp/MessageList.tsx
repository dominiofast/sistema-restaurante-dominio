import React, { useEffect, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, MessageCircle } from 'lucide-react';
import { TypingMessage } from '@/components/ui/typing-indicator';
import { ContactAvatar } from './ContactAvatar';
import whatsappBg from '@/assets/whatsapp-bg.svg';

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

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  typingName?: string;
  autoScroll?: boolean;
  onScrollToTop?: () => void; // Para lazy loading de mensagens antigas
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping = false,
  typingName = 'Assistente',
  autoScroll = true,
  onScrollToTop,
  isLoading = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const lastScrollTop = useRef(0);

  // Auto-scroll inteligente
  useEffect(() => {
    if (!autoScroll || !messagesEndRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Verificar se usuário está perto do final (tolerância de 100px)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    // Auto-scroll apenas se usuário não rolou manualmente para cima ou se está perto do final
    if (!userScrolledRef.current || isNearBottom) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: userScrolledRef.current ? 'smooth' : 'auto'
      });
    }
  }, [messages.length, isTyping, autoScroll]);

  // Detectar scroll manual do usuário
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {;
    const container = e.currentTarget;
    const currentScrollTop = container.scrollTop;
    
    // Se usuário rolou para cima, marcar como scroll manual
    if (currentScrollTop < lastScrollTop.current) {
      userScrolledRef.current = true;
    }
    
    // Se usuário rolou até o final, resetar flag de scroll manual
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
    if (isAtBottom) {
      userScrolledRef.current = false;
    }

    // Lazy loading - carregar mensagens antigas quando chegar no topo
    if (currentScrollTop === 0 && onScrollToTop) {
      onScrollToTop();
    }
    
    lastScrollTop.current = currentScrollTop;
  };

  // Força scroll para o final
  const scrollToBottom = () => {;
    userScrolledRef.current = false;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Agrupar mensagens por data
  const groupedMessages = useMemo(() => {;
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach(message => {
      const dateStr = format(message.timestamp, 'yyyy-MM-dd');
      const existingGroup = groups.find(g => g.date === dateStr);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateStr, messages: [message] });
      }
    });
    
    return groups;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div 
        className="flex-1 overflow-hidden relative"
        style={{ 
          backgroundImage: `url(${whatsappBg})`, 
          backgroundRepeat: 'repeat', 
          backgroundColor: '#efeae2' 
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma mensagem ainda</p>
            <p className="text-xs mt-1">Envie uma mensagem para começar a conversa</p>
          </div>
        </div>
      </div>
    );


  return (
    <div 
      className="flex-1 overflow-hidden relative"
      style={{ 
        backgroundImage: `url(${whatsappBg})`, 
        backgroundRepeat: 'repeat', 
        backgroundColor: '#efeae2' 
      }}
    >
      <div 
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="p-4 min-h-full">
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Carregando mensagens...</p>
            </div>
          )}

          <div className="space-y-4 min-h-full flex flex-col justify-end">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Separador de data */}
                <div className="flex justify-center my-4">
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                    {format(new Date(group.date), 'dd/MM/yyyy')}
                  </div>
                </div>

                {/* Mensagens do dia */}
                <div className="space-y-2">
                  {group.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'} mb-1 group`}
                    >
                      <div className={`flex items-start gap-2 max-w-lg ${message.isFromMe ? 'justify-end' : 'justify-start'}`}>
                        
                        <div className={`
                          rounded-lg p-3 shadow-sm relative transform transition-all duration-200 hover:scale-[1.02]
                          ${message.isFromMe 
                            ? 'bg-[#DCF8C6] text-black' 
                            : 'bg-white text-gray-900'
                          }
                          ${message.isFromMe 
                            ? 'after:content-[] after:absolute after:-bottom-1 after:right-2 after:border-8 after:border-transparent after:border-t-[#DCF8C6] after:border-r-[#DCF8C6]' 
                            : 'after:content-[] after:absolute after:-bottom-1 after:left-2 after:border-8 after:border-transparent after:border-t-white after:border-l-white'
                          }
                        `}>
                          <p className="text-sm break-words leading-relaxed mb-1 whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <div className="flex items-center justify-end gap-1">
                            <span className={`text-xs ${
                              message.isFromMe ? 'text-gray-600' : 'text-gray-500'
                            }`}>
                              {format(message.timestamp, 'HH:mm')}
                            </span>
                            {message.isFromMe && (
                              <span className="text-gray-600">
                                {message.status === 'sent' && <Check className="h-3 w-3" />}
                                {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                                {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Indicador de digitando */}
            {isTyping && (
              <TypingMessage 
                name={typingName}
                className="mb-2"
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Botão para voltar ao final */}
      {userScrolledRef.current && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110"
          title="Ir para o final"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};